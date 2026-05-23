import capUIPlugin from "@zensloom/ui-solid/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [solid(), capUIPlugin],
});
