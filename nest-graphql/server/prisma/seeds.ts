import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

interface MovieInputCreate {
	title: string;
	description?: string;
}

interface UserInput {
	username: string;
	description?: string;
}

interface MovieCommentInput {
	description: string;
	movieId: number;
	userId: number;
}

const prisma = new PrismaClient();

const getRandomInt = (min: number, max: number) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const createManyMovies = async () => {
	if ((await prisma.movie.count()) !== 0) {
		return;
	}

	for (let i = 0; i < 100; i++) {
		const movie: MovieInputCreate = {
			title: faker.person.fullName(), // Updated
			description: faker.lorem.words(6), // Updated
		};

		await prisma.movie.create({
			data: movie,
		});
	}
};

const createManyUsers = async () => {
	if ((await prisma.user.count()) !== 0) {
		return;
	}

	for (let i = 0; i < 100; i++) {
		const user: UserInput = {
			username: faker.internet.userName(), // Better for usernames
			description: faker.lorem.words(6),
		};

		await prisma.user.create({
			data: user,
		});
	}
};

const createManyCommentsOnMovies = async () => {
	if ((await prisma.movieComment.count()) !== 0) {
		return;
	}

	const allMovies = await prisma.movie.findMany();
	const allUsers = await prisma.user.findMany();

	for (const movie of allMovies) {
		const randomLoop = getRandomInt(5, 25);
		for (let i = 0; i < randomLoop; i++) {
			const randomUserId = getRandomInt(0, allUsers.length - 1);
			const user = allUsers[randomUserId];

			const comment: MovieCommentInput = {
				description: faker.lorem.words(6),
				userId: user.id,
				movieId: movie.id,
			};

			await prisma.movieComment.create({
				data: {
					...comment,
					likes: getRandomInt(2, 8),
				},
			});
		}
	}
};

const run = async () => {
	try {
		console.log('createManyMovies() -> start');
		await createManyMovies();
		console.log('createManyMovies() -> done');

		console.log('createManyUsers() -> start');
		await createManyUsers();
		console.log('createManyUsers() -> done');

		console.log('createManyCommentsOnMovies() -> start');
		await createManyCommentsOnMovies();
		console.log('createManyCommentsOnMovies() -> done');
	} finally {
		await prisma.$disconnect();
	}
};

run();
