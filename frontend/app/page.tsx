import styles from './page.module.css'
import Menhera from '@/assets/menhera.png'
import Image from 'next/image'
import Link from 'next/link'
import SignInSocial from '@/components/(auth)/sign-in-social'
import { v4 as uuid } from 'uuid'

export default function Home() {
	return (
		<div>
			<main>
				<Image
					src={Menhera.src}
					className={styles.menhera}
					alt="menhera"
					width={200}
					height={200}
				/>
				<Link className='text-3xl font-bold underline' href={`/chat/${uuid()}`}>Teste</Link>
				<SignInSocial provider='github'>Log In</SignInSocial>
			</main>
		</div>
	)
}
