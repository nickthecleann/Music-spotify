import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";

export default async function Home() {
	const session = await auth();

	if (!session) {
		redirect("/login");
	}

	const user = session.user;

	return (
		<main className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
				<div className="flex items-center space-x-4">
					{user?.image ? (
						<img
							src={user.image}
							alt="Profile"
							className="h-12 w-12 rounded-full"
						/>
					) : (
						<div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
							<span className="text-indigo-600 text-xl font-semibold">
								{user?.name?.[0] || "?"}
							</span>
						</div>
					)}
					<div>
						<h1 className="text-2xl font-semibold text-gray-800">
							Welcome, {user?.name || "User"}!
						</h1>
						<p className="text-gray-500">{user?.email}</p>
					</div>
				</div>
				<form
					action={async () => {
						"use server";
						await signOut();
					}}
					className="mt-6"
				>
					<button
						type="submit"
						className="w-full bg-indigo-600 text-white py-2 px-4 rounded-xl hover:bg-indigo-700 transition-colors"
					>
						Sign Out
					</button>
				</form>
			</div>
		</main>
	);
}
