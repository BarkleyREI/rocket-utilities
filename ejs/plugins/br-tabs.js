// Rocket Tabs: the last tab script you'll ever need

// Version 0.5 (2021/11/08): Initial presentation to Barkley dev team
// Version 0.6 (2023/11/09): Correctly assign ARIA roles
// Version 0.7 (2023/11/13): Down arrow focus behavior
// Version 0.8 (2023/11/14): Multiple tab support
// Version 0.9 (2023/11/29): Nomenclature
// Version 1.0 (2024/04/16): Destructor

;(function (window) {

	'use strict';

	// BRTabsDefaults Options: 
	// - open: on activation, if a string or integer, open that panel

	var BRTabsDefaults = {
		open: 0
	};

	// Default Settings
	class BRTabs {
		constructor(element, options) {
			this.BRTabsDefaults = BRTabsDefaults;
			this.element = element;
			this.navigation = this.element.querySelector('.br-tabs__navigation');
			this.items = Array.from(this.element.querySelectorAll('.br-tabs__item'));			
			this.links = Array.from(this.element.querySelectorAll('.br-tabs__link'));
			this.panels = Array.from(this.element.querySelectorAll('.br-tabs__panel'));
			this.options = { ...BRTabsDefaults, ...options };
			this.bindUIActions();
			this.activate();
		}
		
		// activate()
		// - remove disabled state from buttons
		// - add '--active' class to parent element to enable stying
		// - add region role to panels
		// - close all open panels
		// - if anchor is set, open specified tab (if it exists in this tab set)
		// - else if accordion is true and we are on a desktop, open default tab

		activate() {
			this.element.classList.add('br-tabs--active');
			this.navigation.setAttribute('role', 'tablist');
			this.items.forEach( function(element) {
				element.setAttribute('role', 'presentation');
			});
			this.links.forEach( function(element) {
				element.setAttribute('aria-selected', 'false');
				element.setAttribute('role', 'tab');
				element.setAttribute('tabindex', '-1');
			});
			this.panels.forEach( function(element) {
				element.setAttribute('aria-hidden', 'true');
				element.setAttribute('role', 'tabpanel');
				element.setAttribute('tabindex', '-1');				
			});
			if ((window.location.hash.length > 0 ) && (this.element.querySelector(window.location.hash) !== null)) {
				this.options.open = window.location.hash;
			}
			this.open(this.options.open);
		}

		// destroy(): Remove all added attributes and event listeners

		destroy() {
			var _this = this;
			_this.element.classList.remove('br-tabs--active');
			_this.items.forEach( function(element) {
				element.removeAttribute('role');
			});
			_this.links.forEach( function(element) {
				element.removeAttribute('aria-selected');
				element.removeAttribute('role');
				element.removeAttribute('tabindex');
			});
			this.panels.forEach( function(element) {
				element.removeAttribute('aria-hidden');
				element.removeAttribute('role');
				element.removeAttribute('tabindex');
			});
		}

		// bindUIActions()
		// add click and keydown event listeners to buttons

		bindUIActions() {
	 		var _this = this;
			_this.links.forEach( function(element) {
				element.addEventListener('click', _this.click.bind(_this));
				element.addEventListener('keydown', _this.keydown.bind(_this));
			});	
		}

		// click(event): 
		// - if the object is an accordion, close all items
		// - toggle the aria-expanded and aria-label of the button
		// - toggle the aria-hidden state of the panel associated with the button
		// - if we just opened, push the ID of the button to the window history		

		click(event) {
			var _this = this;
			if (_this.element.classList.contains('br-tabs--active')) {
				event.preventDefault();
				event.stopPropagation();			
				let target = event.currentTarget.getAttribute('href');
				_this.open(target);
				window.history.pushState(null, null, target);
			}
		}

		// keydown(event): 
		// - If left arrow (37), move to the previous link (or the last, if you're at the start)
		// - If right arrow (39), move to the next link (or the first, if you're at the end)
		// - If down arrow (40) focus the active tab

		keydown(event) {
			var _this = this;
			if (_this.element.classList.contains('br-tabs--active')) {
				let code = (event.keyCode) ? event.keyCode : event.which;
				let target = _this.links.indexOf(event.currentTarget);
				if(code === 37) {
					target = target - 1;
					if (target < 0) {
						target = _this.links.length - 1;
					}
					_this.links[target].focus();				
					_this.open(_this.links[target].getAttribute('href'));
				}
				if(code === 39){
					target = target + 1;
					if(target === _this.links.length) {
						target = 0;
					}
					_this.links[target].focus();				
					_this.open(_this.links[target].getAttribute('href'));
				}
				if(code === 40){
					_this.panels[target].focus();
				}
			}
		}		

		// open(tab):
		// - reset attributes on all links and panels
		// - open panel identified either by an ID attribute, or by a 0-indexed tab number
		// - this can be called from outside via [node].toggle.open(tab)

		open(tab) {
			var _this = this;
			let target = null;
			switch( typeof(tab) ) {
				case 'string':
					if(tab.indexOf('#') > -1) {
						target = _this.panels.indexOf(_this.element.querySelector(tab));
					}
					break;
				case 'number':
					if(tab < _this.panels.length) {
						target = tab;
					}
					break;
			}
			if((target !== null) && (target > -1)) {
				_this.links.forEach( function(element) {
					element.setAttribute('aria-selected', 'false');
					element.setAttribute('tabindex', -1);
				});
				_this.links[target].setAttribute('aria-selected', 'true');
				_this.links[target].setAttribute('tabindex', '0');
				_this.panels.forEach( function(element) {
					element.setAttribute('aria-hidden', 'true');
				});
				_this.panels[target].setAttribute('aria-hidden', 'false');
			}
		}
	}

	window.BRTabs = BRTabs;

})(window);
