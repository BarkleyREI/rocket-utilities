import './plugins/br-tabs.js';
import './plugins/br-toggle.js';

window.addEventListener('load', (event) => {

	document.querySelectorAll('.br-tabs').forEach( function( element ) {
		element.tab = Object.assign(new BRTabs(element));
	});	
	
	document.querySelectorAll('.accordion').forEach( function( element ) {
		element.toggle = Object.assign(new BRToggle(element));
	});
	document.querySelectorAll('.collapse').forEach( function( element ) {
		element.toggle = Object.assign(new BRToggle(element, { accordion: false }));
	});
	
});
