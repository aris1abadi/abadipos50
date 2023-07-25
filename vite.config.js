import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import {ioServer} from "./src/lib/server/server"

export default defineConfig({
	plugins: [sveltekit(),ioServer],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
