import { PDFDocument } from "pdf-lib";
import * as fs from "fs";
import { getMimeType } from "stream-mime-type";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootPath = __dirname;

async function writeJpgFile(buffer, name) {
	fs.writeFileSync(name, buffer);
}

async function getImageFromPdf() {
	const existingPdfBytes = await new Promise((resolve, reject) => {
		fs.readFile(path.join(rootPath, "test.pdf"), (err, result) => {
			if (err) {
				reject(err);
			}
			if (!err) {
				resolve(result);
			}
		});
	});
	const pdfDoc = await PDFDocument.load(existingPdfBytes);
	const pages = pdfDoc.getPages();
	const result = [];
	pages[0].doc.context.indirectObjects.forEach((el) => {
		if (el.hasOwnProperty("contents")) result.push(el.contents);
	});
	const mime = await Promise.all(
		result.map(async (el) => {
			return new Promise(async (resolve) => {
				const res = await getMimeType(el);
				if (res) {
					resolve(res);
				}
			});
		})
	);
	await Promise.all(
		mime.map(async (el, i) => {
			if (el.mime === "image/jpeg") {
				return new Promise(async (resolve) => {
					const res = await writeJpgFile(result[i], `image-${i}.jpg`);
					resolve(res);
				});
			}
		})
	);
}

getImageFromPdf().then(console.losg).catch(console.error);
