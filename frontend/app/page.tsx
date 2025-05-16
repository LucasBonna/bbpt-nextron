import styles from './page.module.css'
import EditSVG from '@/assets/edit.svg'
import Menhera from '@/assets/menhera.png'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './components/ui/button'

export default function Home() {
	return (
		<div className={styles.wrapper}>
			<main className={styles.main}>
				<div className={styles.header}>
					<h1 className={styles.headerText}>NextJS + Electron Boilerplate</h1>
					<h4 className={styles.headerSubText}>
						That one boilerplate you couldn{"'"}t find, until now.
					</h4>
				</div>
				<Image
					src={Menhera.src}
					className={styles.menhera}
					alt="menhera"
					width={200}
					height={200}
				/>
				<Link className='text-3xl font-bold underline' href="/chat/123">Teste</Link>
				<Button>Test Button</Button>
				<div className={styles.note}>
					<EditSVG />
					Get started by editting frontend/app/page.tsx
				</div>
				<footer className={styles.footer}>
					{'<'}/{'>'} with ♥
				</footer>
			</main>
		</div>
	)
}
