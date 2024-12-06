"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

const DiscordIcon = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
	<svg
		width="32px"
		height="32px"
		viewBox="0 0 32 32"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M2 11.6C2 8.23969 2 6.55953 2.65396 5.27606C3.2292 4.14708 4.14708 3.2292 5.27606 2.65396C6.55953 2 8.23969 2 11.6 2H20.4C23.7603 2 25.4405 2 26.7239 2.65396C27.8529 3.2292 28.7708 4.14708 29.346 5.27606C30 6.55953 30 8.23969 30 11.6V20.4C30 23.7603 30 25.4405 29.346 26.7239C28.7708 27.8529 27.8529 28.7708 26.7239 29.346C25.4405 30 23.7603 30 20.4 30H11.6C8.23969 30 6.55953 30 5.27606 29.346C4.14708 28.7708 3.2292 27.8529 2.65396 26.7239C2 25.4405 2 23.7603 2 20.4V11.6Z"
			fill="white"
		/>
		<path
			d="M23.6361 9.33998C22.212 8.71399 20.6892 8.25903 19.0973 8C18.9018 8.33209 18.6734 8.77875 18.5159 9.13408C16.8236 8.89498 15.1469 8.89498 13.4857 9.13408C13.3283 8.77875 13.0946 8.33209 12.8974 8C11.3037 8.25903 9.77927 8.71565 8.35518 9.3433C5.48276 13.4213 4.70409 17.3981 5.09342 21.3184C6.99856 22.6551 8.84487 23.467 10.66 23.9983C11.1082 23.4189 11.5079 22.8029 11.8523 22.1536C11.1964 21.9195 10.5683 21.6306 9.9748 21.2951C10.1323 21.1856 10.2863 21.071 10.4351 20.9531C14.0551 22.5438 17.9881 22.5438 21.5649 20.9531C21.7154 21.071 21.8694 21.1856 22.0251 21.2951C21.4299 21.6322 20.8 21.9211 20.1442 22.1553C20.4885 22.8029 20.8865 23.4205 21.3364 24C23.1533 23.4687 25.0013 22.6567 26.9065 21.3184C27.3633 16.7738 26.1261 12.8335 23.6361 9.33998ZM12.3454 18.9075C11.2587 18.9075 10.3676 17.9543 10.3676 16.7937C10.3676 15.6331 11.2397 14.6783 12.3454 14.6783C13.4511 14.6783 14.3422 15.6314 14.3232 16.7937C14.325 17.9543 13.4511 18.9075 12.3454 18.9075ZM19.6545 18.9075C18.5678 18.9075 17.6767 17.9543 17.6767 16.7937C17.6767 15.6331 18.5488 14.6783 19.6545 14.6783C20.7602 14.6783 21.6514 15.6314 21.6323 16.7937C21.6323 17.9543 20.7602 18.9075 19.6545 18.9075Z"
			fill="#5865F2"
		/>
	</svg>
);

export default function Login() {
	const [isHovered, setIsHovered] = useState(false);

	const handleLogin = () => {
		signIn("discord");
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#36393f]">
			<div className="w-96 rounded-lg bg-[#2f3136] p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
				<div className="mb-8 text-center">
					<h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
					<p className="mt-2 text-gray-400">We're excited to see you again!</p>
				</div>

				<button
					type="button"
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					onClick={handleLogin}
					className={`w-full rounded-md bg-[#5865f2] p-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-[#4752c4] ${
						isHovered ? "scale-105" : "scale-100"
					}`}
				>
					<div className="flex items-center justify-center space-x-2">
						<DiscordIcon />
						<span>Login with Discord</span>
					</div>
				</button>
			</div>
		</div>
	);
}
