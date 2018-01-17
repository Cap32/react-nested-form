import jsdom from 'jsdom';
import delay from 'delay';

export async function resetBOM() {
	global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
	if (typeof window === 'undefined') {
		global.window = global.document.defaultView;
		global.navigator = global.window.navigator;
	}
	await delay(1);
}
