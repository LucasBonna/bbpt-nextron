import path from 'node:path';
import { app, BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import electronUpdater from 'electron-updater';
import electronIsDev from 'electron-is-dev';
import ElectronStore from 'electron-store';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { autoUpdater } = electronUpdater;
let appWindow: BrowserWindow | null = null;
let nextProcess: ReturnType<typeof spawn> | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const store = new ElectronStore();

class AppUpdater {
	constructor() {
		log.transports.file.level = 'info';
		autoUpdater.logger = log;
		autoUpdater.checkForUpdatesAndNotify();
	}
}

const installExtensions = async () => {
	/**
	 * NOTE:
	 * As of writing this comment, Electron does not support the `scripting` API,
	 * which causes errors in the REACT_DEVELOPER_TOOLS extension.
	 * A possible workaround could be to downgrade the extension but you're on your own with that.
	 */
	/*
	const {
		default: electronDevtoolsInstaller,
		//REACT_DEVELOPER_TOOLS,
		REDUX_DEVTOOLS,
	} = await import('electron-devtools-installer')
	// @ts-expect-error Weird behaviour
	electronDevtoolsInstaller.default([REDUX_DEVTOOLS]).catch(console.log)
	*/
};

const spawnAppWindow = async () => {
	if (electronIsDev) await installExtensions();

	const RESOURCES_PATH = electronIsDev
		? path.join(__dirname, '../../assets')
		: path.join(process.resourcesPath, 'assets');

	const getAssetPath = (...paths: string[]): string => {
		return path.join(RESOURCES_PATH, ...paths);
	};

	const PRELOAD_PATH = path.join(__dirname, 'preload.js');

	appWindow = new BrowserWindow({
		width: 800,
		height: 600,
		icon: getAssetPath('icon.png'),
		show: false,
		webPreferences: {
			preload: PRELOAD_PATH,
		},
	});

	appWindow.loadURL(
		electronIsDev ? 'http://localhost:3000' : 'http://localhost:3000'
	);
	appWindow.maximize();
	appWindow.setMenu(null);
	appWindow.show();

	if (electronIsDev) appWindow.webContents.openDevTools({ mode: 'right' });

	appWindow.on('closed', () => {
		appWindow = null;
	});
};

app.on('ready', () => {
	// Inicia o servidor Next.js em produção
	nextProcess = spawn(
		process.platform === 'win32' ? 'yarn.cmd' : 'yarn',
		['frontend:dev'],
		{
			cwd: path.join(__dirname, '../../frontend'),
			stdio: 'inherit',
			shell: true,
		}
	);

	// Aguarda o Next.js subir antes de abrir a janela (ajuste o tempo se necessário)
	setTimeout(() => {
		new AppUpdater();
		spawnAppWindow();
	}, 5000);
});

app.on('window-all-closed', () => {
	if (nextProcess) nextProcess.kill();
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

/*
 * ======================================================================================
 *                                IPC Main Events
 * ======================================================================================
 */

ipcMain.handle('sample:ping', () => {
	return 'pong';
});
