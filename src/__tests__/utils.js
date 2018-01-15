import jsdom from 'jsdom';

export function resetBOM() {
	global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
	if (typeof window === 'undefined') {
		global.window = global.document.defaultView;
		global.navigator = global.window.navigator;
	}
}
