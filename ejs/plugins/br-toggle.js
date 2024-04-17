// Rocket BRToggle: The last toggling script you'll ever need

// Version 0.4 (2021/08/02): Initial presentation to Barkley dev team
// Version 0.5 (2023/11/06): Simplification and incorporation of grid-rows auto-height technique
// Version 0.6 (2023/11/07): Further simplification and support for nested components
// Version 0.7 (2023/11/08): Remove requirement that one accordion item must be open at all times
// Version 0.8 (2023/11/09): Open parent accordions when nested
// Version 0.9 (2023/11/29): Nomenclature
// VErsion 1.0 (2024/04/16): Destructor

;(function (window) {

	'use strict';

	// BRToggleDefaults Options: 
	// - accordion: if true, opening one item closes all others
	// - open: on activation, if false, do not open panel; if a string or integer, open that panel

	var BRToggleDefaults = {
		accordion: true,
		open: 0
	};

	var mql = window.matchMedia('(min-width: 1024px)');

	// Default Settings
	class BRToggle {
		constructor(element, options) {
			this.BRToggleDefaults = BRToggleDefaults;
			this.element = element;
			this.buttons = Array.from(this.element.querySelectorAll('.br-toggle__button')).filter(item => item.closest('.br-toggle') == this.element); // filter out nested toggles
			this.panels = Array.from(this.element.querySelectorAll('.br-toggle__panel')).filter(item => item.closest('.br-toggle') == this.element); // filter out nested elements
			this.options = { ...BRToggleDefaults, ...options };
			this.bindUIActions();
			this.activate();
		}

		// activate()
		// - remove disabled state from buttons
		// - add '--active' class to parent element to enable styling
		// - add region role to panels
		// - close all open panels
		// - if anchor is set, open specified tab
		// - else if accordion is true and we are on a desktop, open default tab

		activate() {
			this.element.classList.add('br-toggle--active');
			this.buttons.forEach( function(element) {
				element.removeAttribute('disabled');
			});
			this.panels.forEach( function(element) {
				element.setAttribute('role', 'region');
			});
			this.closeAll();
			if (window.location.hash.length > 0 ) {
				this.options.open = window.location.hash;
				this.open(this.options.open);			
			} else if (this.options.accordion && mql.matches) {
				this.open(this.options.open);
			}
		}

		// destroy(): Remove all added attributes and event listeners
		
		destroy() {
			var _this = this;
			_this.element.classList.remove('br-toggle--active');
			_this.buttons.forEach( function(element) {
				element.setAttribute('disabled', true);
				element.removeAttribute('aria-expanded');
				element.removeAttribute('aria-label');
			});
			_this.panels.forEach(function(element) {
				element.removeAttribute('aria-hidden');				
				element.removeAttribute('role');
			});
		}
		
		// bindUIActions()
		// add click and keydown event listeners to buttons

		bindUIActions() {
	 		var _this = this;
			_this.buttons.forEach( function(element) {
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
			if (_this.element.classList.contains('br-toggle--active')) {
				event.preventDefault();
				event.stopPropagation();
				let toggle = event.currentTarget;
				let panel = _this.panels[_this.buttons.indexOf(event.currentTarget)];
				let expanded = (toggle.getAttribute('aria-expanded') === 'true') ? 'false' : 'true';
				let label = toggle.getAttribute('aria-label');
				label = (label.indexOf('open') > -1) ? label.replace('open','close') : label.replace('close','open');
				let hidden = panel.getAttribute('aria-hidden');
				hidden =  (hidden === 'true') ? 'false' : 'true';
				if (_this.options.accordion) {
					_this.closeAll();
				}
				toggle.setAttribute('aria-expanded', expanded);
				toggle.setAttribute('aria-label', label);
				panel.setAttribute('aria-hidden', hidden);
				if(expanded === 'true') {
					window.history.pushState(null, null, '#' + toggle.getAttribute('id'));
				} else {
					window.history.pushState(null, null, ' ');
				}
			}
		}

		// closeAll(): Close all tabs
		// - reset aria-expanded and aria-label on button
		// - reset aria-hidden on toggle

		closeAll() {
			var _this = this;
			_this.buttons.forEach( function(element) {
				element.setAttribute('aria-expanded', 'false');
				element.setAttribute('aria-label', element.innerText + ' (click to open)' );
			});
			_this.panels.forEach( function(element) {
				element.setAttribute('aria-hidden', 'true');
			});
		}
		
		// keydown(event): 
		// - If up arrow (38), move to the previous button (or the last, if you're at the start)
		// - If down arrow (40), move to the next button (or the first, if you're at the end)

		keydown(event) {
			var _this = this;
			if (_this.element.classList.contains('br-toggle--active')) {
				let code = (event.keyCode) ? event.keyCode : event.which;
				let target = _this.buttons.indexOf(event.currentTarget);
				if(code === 38) {
					target = target - 1;
					if (target < 0) {
						target = _this.buttons.length - 1;
					}
					_this.buttons[target].focus();
					_this.open(target);
				}
				if(code === 40) {
					target = target + 1;
					if(target === _this.buttons.length) {
						target = 0;
					}
					_this.buttons[target].focus();
					_this.open(target);
				}
			}
		}

		// open(tab):
		// - open panel identified either by an ID attribute, or by a 0-indexed tab number
		// - if the panel is nested inside another accordion, open that accordion too
		// - this can be called from outside via [node].toggle.open(tab)

		open(tab) {
			var _this = this;
			let target = null;
			switch( typeof(tab) ) {
				case 'string':
					if(tab.indexOf('#') > -1) {
						target = _this.buttons.indexOf(_this.element.querySelector(tab));
					}
					break;
				case 'number':
					if(tab < _this.buttons.length) {
						target = tab;
					}
					break;
			}
			if((target !== null) && (target > -1)) {
				if(_this.options.accordion) {
					_this.closeAll();
				}
				_this.buttons[target].setAttribute('aria-label', _this.buttons[target].innerText + ' (click to close)' );
				_this.buttons[target].setAttribute('aria-expanded', 'true');
				_this.panels[target].setAttribute('aria-hidden', 'false');
				let nested = _this.element.closest('.br-toggle__panel');
				if(nested !== null) {
					nested.closest('.br-toggle').toggle.open('#' + nested.getAttribute('aria-labelledby'));
				}
			}
		}
	}

	window.BRToggle = BRToggle;

})(window);
