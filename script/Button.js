var Button = {
	_hookRegistered: false,

	_ensureTurnHook: function() {
		if(Button._hookRegistered || typeof Engine == 'undefined') {
			return;
		}
		Engine.registerTurnHook('button.cooldowns', Button.tickCooldowns, 200);
		Button._hookRegistered = true;
	},

	tickCooldowns: function() {
		$('div.button').each(function() {
			var btn = $(this);
			if(!btn.data('onCooldown')) {
				return;
			}
			var current = btn.data('remainingTurns') || 0;
			current -= 1;
			btn.data('remainingTurns', current);
			var total = Math.max(1, btn.data('cooldownTurns') || 1);
			var left = Math.max(0, current / total);
			$('div.cooldown', btn).width((left * 100) + "%");
			$SM.set('cooldown.' + btn.attr('id'), Math.max(0, current), true);
			if(current <= 0) {
				Button.clearCooldown(btn, true);
			}
		});
	},

	Button: function(options) {
		if(typeof options.cooldown == 'number') {
			this.data_cooldown = options.cooldown;
		}
		this.data_remaining = 0;
		if(typeof options.click == 'function') {
			this.data_handler = options.click;
		}

		var el = $('<div>')
			.attr('id', typeof(options.id) != 'undefined' ? options.id : "BTN_" + Engine.getGuid())
			.addClass('button')
			.text(typeof(options.text) != 'undefined' ? options.text : "button")
			.click(function() {
				if(!$(this).hasClass('disabled')) {
					var noTurnCost = $(this).data('noTurnCost') === true;
					if(!noTurnCost && !Engine.canActThisTurn) {
						return;
					}
					var result = $(this).data("handler")($(this));
					if(result === false) {
						return;
					}
					if(!noTurnCost) {
						Engine.consumeTurnAction();
					}
					Button.cooldown($(this));
				}
			})
			.data("handler",  typeof options.click == 'function' ? options.click : function() { Engine.log("click"); })
			.data("remaining", 0)
			.data("cooldown", typeof options.cooldown == 'number' ? options.cooldown : 0)
			.data("noTurnCost", options.noTurnCost === true)
			.data('boosted', options.boosted ?? (() => false));

		el.append($("<div>").addClass('cooldown'));

		// waiting for expiry of residual cooldown detected in state
		Button.cooldown(el, 'state');

		if(options.cost) {
			var ttPos = options.ttPos ? options.ttPos : "bottom right";
			var costTooltip = $('<div>').addClass('tooltip ' + ttPos);
			for(var k in options.cost) {
				$("<div>").addClass('row_key').text(_(k)).appendTo(costTooltip);
				$("<div>").addClass('row_val').text(options.cost[k]).appendTo(costTooltip);
			}
			if(costTooltip.children().length > 0) {
				costTooltip.appendTo(el);
			}
		}

		if(options.width) {
			el.css('width', options.width);
		}

		return el;
	},

	saveCooldown: true,

	setDisabled: function(btn, disabled) {
		if(btn) {
			if(!disabled && !btn.data('onCooldown') && !btn.data('turnLocked')) {
				btn.removeClass('disabled');
			} else if(disabled) {
				btn.addClass('disabled');
			}
			btn.data('disabled', disabled);
		}
	},

	isDisabled: function(btn) {
		if(btn) {
			return btn.data('disabled') === true;
		}
		return false;
	},

	cooldown: function(btn, option) {
		if(Engine.STRICT_TURNS) {
			if(Button.saveCooldown) {
				$SM.remove('cooldown.'+ btn.attr('id'));
			}
			return;
		}
		Button._ensureTurnHook();
		var cd = btn.data("cooldown");
		if (btn.data('boosted')()) {
			cd /= 2;
		}
		var id = 'cooldown.'+ btn.attr('id');
		if(cd > 0) {
			if(typeof option == 'number') {
				cd = option;
			}
			// param "start" takes value from cooldown time if not specified
			var start;
			switch(option){
				// a switch will allow for several uses of cooldown function
				case 'state':
					if(!$SM.get(id)){
						return;
					}
					start = Math.min($SM.get(id), cd);
					break;
				default:
					start = cd;
			}
			start = Math.max(1, Math.ceil(start));
			var total = Math.max(1, Math.ceil(cd));
			var left = (start / total).toFixed(4);
			Button.clearCooldown(btn);
			if(Button.saveCooldown){
				$SM.set(id,start);
			}
			btn.data('remainingTurns', start);
			btn.data('cooldownTurns', total);
			$('div.cooldown', btn).width(left * 100 +"%");
			btn.addClass('disabled');
			btn.data('onCooldown', true);
		}
	},

	clearCooldown: function(btn, cooldownEnded) {
		var ended = cooldownEnded || false;
		if(!ended){
			$('div.cooldown', btn).stop(true, true);
		}
		btn.data('onCooldown', false);
		btn.removeData('remainingTurns');
		btn.removeData('cooldownTurns');
		if(btn.data('countdown')){
			Engine.clearInterval(btn.data('countdown'));
			$SM.remove('cooldown.'+ btn.attr('id'));
			btn.removeData('countdown');
		} else if(Button.saveCooldown) {
			$SM.remove('cooldown.'+ btn.attr('id'));
		}
		if(!btn.data('disabled')) {
			if(!btn.data('turnLocked')) {
				btn.removeClass('disabled');
			}
		}
	}
};
