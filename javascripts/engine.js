var STATUS_ONLINE = 3;
var STATUS_AFK = 2;
var STATUS_DND = 1;
var STATUS_OFFLINE = 0;

var engine = {
	
	map: {
		width: 1600,
		height: 1600,
		texture: "maps/nebula.jpg",
		dom_id: "#game_map",
		actual_scale: 0.6,
		tile_width: 32,
		lines_x: 0,
		lines_y: 0,
		sector_size: 5,
		
		stars: [],
		
		load: function(){
			var texture = $('<img/>');
			
			texture.attr('src', this.texture).addClass('background');
			$(this.dom_id).append(texture);
			
			var canvas = $('<canvas>');
			$(this.dom_id).append(canvas);
			
			this.scale();
		},
		
		calculateLines: function(){
			this.lines_x = Math.round(this.width / this.tile_width);
			this.lines_y = Math.round(this.height / this.tile_width);
		},
		
		scale: function(new_scale){
			
			if (new_scale != undefined) {
				this.actual_scale = Math.round(new_scale*10)/10;
			}
			
			var width = Math.round(this.width*this.actual_scale);
			var height = Math.round(this.height*this.actual_scale);
			
			$('.background', this.dom_id).css({
				width: width,
				height: height
			});
			
			$('canvas', this.dom_id).attr('width',width)
															.attr('height', height);
			
			this.updateStars();
			this.render();
		},
		
		toPixels: function(pos, center){
			var tile_width = this.tile_width * this.actual_scale;
			var out = (tile_width * (pos-1));
			
			if (center) {
				out += Math.round(tile_width / 2);
			}
			
			return out;
		},
		
		render: function(){
			var canvas = $('canvas', this.dom_id)[0].getContext("2d");
			var self = this;
			
			canvas.clearRect(0,0,this.width*this.actual_scale, this.height*this.actual_scale);
			
			var tile_width = self.tile_width * self.actual_scale;
			
			
			var sectors_x = self.lines_x / self.sector_size;
			var sectors_y = self.lines_y / self.sector_size;
			var sector_size_pixels = tile_width*self.sector_size;	
			
			canvas.globalAlpha = 0.2;
			
			for (var y=1; y <= sectors_y; y++) {
				for (var x=1; x <= sectors_x; x++) {
					var stars = engine.stars.forSector(x,y);
					var players_ids = $.map(stars, function (star, index) {
						return star.user_id;
					}).unique();
					
					if (players_ids.length == 1) {
						var player = engine.players.get(players_ids[0]);
						
						if (player != undefined) {
							canvas.fillStyle = player.color;
							console.log("Sektor: "+x+":"+y+" nalezy do gracza "+player.login);
							canvas.fillRect((x-1)*sector_size_pixels, (y-1)*sector_size_pixels, sector_size_pixels, sector_size_pixels);
						}
						
					}
	
				}
			}
			canvas.globalAlpha = 1.0;

			var bold = 0;

			for (var x=0; x <= self.lines_x; x++) {

				if (bold == self.sector_size) {
					canvas.lineWidth = 1.5;
					canvas.strokeStyle = 'rgba(255, 255, 255, 0.2)';
					bold = 1;
				} else {
					canvas.lineWidth = 1;
					canvas.strokeStyle = 'rgba(255, 255, 255, 0.1)';
					bold++;
				}

				canvas.beginPath();
				canvas.moveTo(x*tile_width,0);
				canvas.lineTo(x*tile_width,self.height*self.actual_scale);
				canvas.stroke();
			}

			var bold = 0;

			for (var y=0; y <= self.lines_y; y++) {
				if (bold == self.sector_size) {
					canvas.lineWidth = 2;
					canvas.strokeStyle = 'rgba(255, 255, 255, 0.2)';
					bold = 1;
				} else {
					canvas.lineWidth = 1;
					canvas.strokeStyle = 'rgba(255, 255, 255, 0.1)';
					bold++;
				}

				canvas.beginPath();
				canvas.moveTo(0,y*tile_width);
				canvas.lineTo(self.width*self.actual_scale,y*tile_width);
				canvas.stroke();
			}
		},
		
		updateStars: function(){
			var self = this;
			$.each(this.stars, function() {
				var star = this;
				
				if (star.dom_id == undefined) {
					var marker = $('<img />');
					var new_id = 'marker_'+star.id;
					
					marker.attr('src', star.user_id == 1 ? 'images/conquest-marker.png' : 'images/solar-marker.png')
								.attr('id', new_id)
								.attr('tooltip', star.title);
					
					
					star.dom_id = "#"+new_id;
					$(self.dom_id).append(marker);
					
					marker.click(function () {
						star.user_id = engine.players.current_player().id;
						engine.events.add({
							body: "Kolonizacja PX-106 dobiegła końca"
						});
						engine.stars.update();
						engine.map.render();
					});

					marker.has_tooltip();
				}

				$(star.dom_id).css({
					left: self.toPixels(star.x, true) - 8 + "px",
					top: self.toPixels(star.y, true) - 8 + "px"
				});
			});
		},
	},

	stars: {
		dom_id: "#stars",
		
		forUser: function(user_id){
			return $.grep(engine.map.stars, function (star, index) {
				return (star.user_id == user_id);
			});
		},
		
		forCurrentUser: function(){
			return this.forUser(engine.players.current_player_id);
		},
		
		forSector: function(x,y){
			var sector_size = engine.map.sector_size;
			var x = (x-1) * sector_size;
			var y = (y-1) * sector_size;
			
			return $.grep(engine.map.stars, function (star, index) {
				return ((star.x >= x && star.x <= x+sector_size) && (star.y >= y && star.y <= y+sector_size));
			})
		},
		
		update: function(){
			var self = this;
			$(self.dom_id).empty();	
			
			var stars = self.forCurrentUser();
			
			$.each(stars, function () {
				var html = $('<li><a href="#"><img src="'+this.image+'" />'+this.name+'</a></li>');
				html.attr('tooltip', 'Upuszczenie tutaj statku spowoduje przypisanie go do tej gwiazdy');
				
				html.has_tooltip();
				$(self.dom_id).append(html);
			});
			
		}
		
	},
	
	benchmark: {
		start: 0,
		stop: function(){
			var latency = new Date() - this.start;
			$('.ui-latency').text(latency + "ms");
		}
	},
	
	building: {
		list: [],
		dom_id: "#process",
		
		process: function(){
			var self = this;
			
			for (var i=0; i < engine.building.list.length; i++) {
				var b = engine.building.list[i];
				
				var image = new Image();
				image.src = b.image_url;
				
				if (b.dom_id == undefined) {
					var html = $('<li><a href="#"><canvas width="30" height="30"></canvas><div><h4>'+b.title+'</h4><span> --- </span></div></a></li>');
					
					var new_id = 'building_'+b.id;
					
					html.attr('id', new_id).hide();
					$(self.dom_id).prepend(html);
					html.slideDown();
					
					var link = html.find('a');
					link.data('building_id', b.id);
					
					link.click(function () {
						var id = $(this).data('building_id');
						self.remove(id);
						$(this).animate({ height: 0, opacity: 0 }, 800,function () { $(this).remove(); });
						return false;
					});
					
					b.dom_id = new_id;
					
					link.attr('tooltip', 'Klinkij aby anulować')
					link.has_tooltip();
				}
				
				var progress = $('#'+b.dom_id);
				var curr_miliseconds = b.building_end_at - new Date();
				var seconds = Math.round(curr_miliseconds / 1000);
				progress.find('span').text(distance_of_time_in_words(Math.round(curr_miliseconds / 1000)));
				
				var canvas = $(progress).find('canvas')[0].getContext("2d");
				canvas.clearRect(0,0,30,30);
				
				try {
					canvas.drawImage(image,0,0,30,30);
				} catch(err) {
					console.log(err.message);
				}
				
				canvas.fillStyle = "rgba(0,0,0, 0.7)";
				
				var y = (seconds * 100) / b.time * 0.01;
				canvas.fillRect(0,0,30,Math.round(30*y));
				
				if (seconds < 15) {
					if (seconds % 2 == 0) {
						progress.find('a').css({ background: "rgba(255, 0 ,0 ,0.4)" });
					}else{
						progress.find('a').css({ background: "rgba(255, 0 ,0 ,0.0)" });
					}
				}

				if (curr_miliseconds <= 0) {
					progress.animate({ height: 0, opacity: 0 }, 800,function () { $(this).remove(); });
					engine.building.remove(b.id);
				}	
			}
			
			var text = (self.list.length == 0) ? 'Procesy' : 'Procesy ('+self.list.length+')';
			$(self.dom_id+"_count").text(text);
			
			setTimeout(function() {
				engine.building.process();
			}, 1000);
		},
		
		add: function(options){
			this.list.push(options);
		},
		
		get: function(id){
			return $.grep(this.list, function (building, index) {
				return (id == building.id)
			})[0];
		},
		
		remove: function(id){
			var self = this;

			$.each(self.list, function (index) {
				var building = this;
				if (building.id == id) {
					
					var options = {
						dataType: "script",
						type: "POST"
					};
					
					var curr_miliseconds = building.building_end_at - new Date();
					
					if (curr_miliseconds <= 0) {
						options.url = building.complete_url;
					}else{
						options.url = building.cancel_url;
						options.data = "_method=destroy";
					}
					
					$.ajax(options);
					self.list.splice(index, 1);
				}
			});
		}
	},
	
	resources: {
		antimatter: 0, 
		energy: 0,
		metal: 0,
		
		timer: null,
		
		plusColor: "#0F0",
		minusColor: "#F00",
		
		setValue: function(key, value){
			this[key] = value;
			this.process();
		},
		
		process: function(){
			var self = this;

			$('#antimatter').text(self.antimatter);
			$('#metal').text(self.metal);
			engine.ships.update();
			
			if (self.timer != null) { return; };
			
			self.timer = setInterval(function() {
				var energy = parseInt($('#energy').text());
				
				if (isNaN(energy)) { energy = 0; }
				
				var steps = 1;
				var difrence = Math.abs(energy - self.energy);
				
				if (difrence >= 10000) {
					steps = 10000;
				} else if (difrence >= 1000) {
					steps = 1000;
				} else if (difrence >= 100) {
					steps = 100;
				} else if (difrence >= 10) {
					steps = 10;
				} else {
					steps = 1;
				}
				
				if (energy < self.energy) {
					energy += steps;
					$('#energy').css({color: self.plusColor});
				}else if (energy > self.energy){
					energy -= steps;
					$('#energy').css({color: self.minusColor});
				}
				
				if (energy == self.energy) {
					clearTimeout(self.timer);
					self.timer = null;
					$('#energy').css({color: ""});
				}
				
				$('#energy').text(energy);
			}, 100);
		}
	},
	
	players: {
		list: [],
		current_player_id: 0,
		dom_id: "#players",
		
		update: function(){
			var self = this;
			var online = 0;
			
			for (var i=0; i < self.list.length; i++) {
				var player = self.list[i];
				
				if (player.dom_id == undefined) {
					var new_id = 'player_'+player.id;
					
					var item = $('<li><a href="#"><img src="'+player.avatar+'" /><div><h4>'+player.login+'</h4><span>---</span></div></a></li>');
					item.attr('id', new_id);
					item.data('user_id', player.id);
					
					item.click(function () {
						var player = engine.players.get($(this).data('user_id'));
						
						$(engine.chat.dom_id+'_form input[type="text"]').val(player.login+">").focus();
						return false;
					});
					
					player.dom_id = '#'+new_id;
					item.attr('tooltip', 'Kliknij aby wysłać prywatną wiadomość');
					item.has_tooltip();
					$(self.dom_id).append(item);
				}
				
				var item = $(player.dom_id);
				if (player.status == STATUS_OFFLINE) {
					item.addClass('inactive');
				}else{
					item.removeClass('inactive');
					online++;
				}
				
				item.find('h4').css({
					color: player.color
				});
				item.find('span').text(self.to_status(player.status));
			}
			
			$(self.dom_id+'_count').text('Gracze('+online+'/'+self.list.length+')');
		},
		
		to_status: function(status){
			var status_names = ['Offline', 'DND', 'AFK', 'Online'];
			return status_names[status];
		},
		
		add: function(player){
			this.list.push(player);
			this.update();
			
			return this;
		},
		
		get: function(player_id){
			return $.grep(this.list, function (player, index) {
				return (player_id == player.id)
			})[0];
		},
		
		current_player: function(){
			return this.get(this.current_player_id);
		}
	},
	
	turns: {
		turn_time: 0,
		turn_end: 0,
		current_player_id: 0,
		rotate_turn_url: 'data/turn.js',
		
		initialize: function(){
			var self = this;
			
			setInterval(function () {
				self.update();
			}, 1000);
		},
		
		setTurnTime: function(time){
			this.turn_time = time * 1000;
		},
		
		update: function(){
			var miliseconds = this.turn_end - new Date();
			var seconds = Math.round(miliseconds / 1000);
			var player = engine.players.get(this.current_player_index);
			
			if (seconds <= 0) {
				this.nextTurn();
				$('#turn_time span').text("...");
			} else {
				$('#turn_time .color').css({ background: player.color });
				$('#turn_time span').text(distance_of_time_in_words(seconds));
			} 

		},
		
		nextTurn: function(){
			this.current_player_index = null;
			$.getScript(this.rotate_turn_url);
		},
		
		switchToPlayer: function(player_id, turn_end){
			this.current_player_index = player_id;
			this.turn_end = turn_end;
			
			var player = engine.players.get(player_id);
			
			engine.events.add({
				body: "Turę taktyczną zaczyna: " + player.login
			});
		},
	},
	
	status: {
		last_update: 0,
		update_url: '',
		
		update: function(){
			var self = this;
			
			$.ajax({
				type: "GET",
			  url: self.update_url,
			  dataType: "script",
				data: "time="+self.last_update,
				complete: function () { setTimeout(function() { engine.status.update(); }, 2000); }
			});
		}
	},
	
	chat: {
		messages: [],
		dom_id: "#chat",
		
		add: function(message){
			var player = engine.players.get(message.user_id);
			var html = $('<p>[<a href="#" style="color: '+player.color+'">'+player.login+'</a>] '+message.body+'!</p>');
			
			this.messages.push(message);
			$(this.dom_id).append(html);
			
			$(this.dom_id).animate({ scrollTop: $(this.dom_id).attr('scrollHeight') }, 1000);
		},

		initialize: function(){
			$(this.dom_id+'_form').submit(function () {
				
				$.ajax({
					type: "POST",
				  url: $(this).attr('action'),
				  dataType: 'script',
					data: $(this).serialize()
				});
				
				$(this).find('input').val('');
				
				return false;
			});
		}
	},
	
	events: {
		list: [],
		dom_id: "#events",
		
		add: function(options){
			//if (this.list.length > 5) { this.list.pop(); };
			var options = options;
			options.created_at = new Date();
			this.list.unshift(options);
			this.update();
		},
		
		update: function(){
			var self = this;
			$(self.dom_id).empty();
			
			if (this.list.length == 0) {
				$(self.dom_id).text('Aktualnie nic się nie dzieje');
			}
			
			var length = this.list.length <= 5 ? this.list.length : 5;
			
			for (var i=0; i < length; i++) {
				var e = self.list[i];
				var html = $('<div class="event">'+ e.body + '</div>');
				html.addClass(e.css);
				
				$(self.dom_id).prepend(html);
			}
			
		},
		
		initialize: function(){
			var self = this;
			var events_list = $('.ui-events .events-list');
			
			$('.ui-events').mouseenter(function () {
				$.each(self.list, function(){
					var e = this;
					var time = e.created_at.getHours() + ":" + e.created_at.getMinutes() + ":" + e.created_at.getSeconds();
					
					var html = $('<p>['+time+'] - '+ e.body + '</p>');
					html.addClass(e.css);

					events_list.append(html);
				});
			}).mouseleave(function () {
				events_list.empty();
			});
		}
		
	},
	
	ships: {
		list: [],
		source: "data/ships.js",
		dom_id: "#stocznia",
		
		sync: function(){
			var self = this;
			$.getJSON(this.source, function (data) {
				self.list = data;
				$(self.dom_id).find('.ui-options').empty();
				self.update();
			});
		},
		
		isAffordable: function(object){
			return (object.antimatter <= engine.resources.antimatter && object.metal <= engine.resources.metal && object.energy <= engine.resources.energy);
		},
		
		dom_list: function(){
			return $(this.dom_id).find('.ui-options');
		},
		
		update: function(){
			var self = this;
			
			var dom_list = $(this.dom_id).find('.ui-options');
			
			$.each(self.list, function () {
				var ship = this;
				
				if (ship.dom_id == undefined) {
					var html = $('<li><a href="#"><img src="'+ship.image+'" /><div class="content"><h5>'+ship.name+'</h5><p class="info">'+ship.description+'</p><p class="require"><span class="time">Budowa: '+distance_of_time_in_words(ship.time)+' min</span><span class="antimatter">'+ship.antimatter+'</span><span class="metal">'+ship.metal+'</span><span class="energy">'+ship.energy+'</span></p></div></a></li>');
					
					var id = 'ship_'+ship.id;
					ship.dom_id = '#'+id;
					html.attr('id', id);
					dom_list.prepend(html);
					
					var item = $(ship.dom_id);
					
					item.click(function () {

						if (self.isAffordable(ship)) {
							$('#process_count').click();
							
							engine.building.add({
								title: "Budowa: " + ship.name,
								building_end_at: new Date().getTime() + ship.time * 1000,
								time: ship.time,
								image_url: ship.image,
								id: Math.round(Math.random()*1000),
								complete_url: 'complete.js',
								cancel_url: 'cancel.js'
							});
							
							engine.resources.antimatter -= ship.antimatter;
							engine.resources.metal -= ship.metal;
							engine.resources.energy -= ship.energy;
							engine.resources.process();
							
						}else{
							alert('Nie masz wystarczająco dużo surowców...')
						}
						
						return false;
					});
					
				}
				
				var item = $(ship.dom_id);
				
				if (self.isAffordable(ship)) {
					item.removeClass('inactive');
				}else{
					item.addClass('inactive');
				}
				
			});
			
		},
	},
	
	initialize: function() {
		this.configGameMap();
		this.building.process();
		this.resources.process();
		this.status.update();
		this.chat.initialize();
		this.events.initialize();
		this.ships.sync();
		this.turns.initialize();
		this.stars.update();
		
		$('body').append($('<div class="ui-box tooltip" id="tooltip">'));
		$('.ui-menu a, .ui-tabs a').act_as_tabs();
		$('.ui-resources li, .ui-latency, #turn_time').has_tooltip();
		
		this.map.load();
	},
	
	configGameMap: function(){
		$(this.map.dom_id).mousedown(function (event) {
        $(this)
            .data('down', true)
            .data('x', event.clientX)
						.data('y', event.clientY)
            .data('scrollLeft', this.scrollLeft)
						.data('scrollTop', this.scrollTop);
        return false;
    }).mouseup(function (event) {
			$(this).data('down', false).css('cursor', 'default');
    }).mousemove(function (event) {
			if ($(this).data('down') == true) {
				this.scrollLeft = $(this).data('scrollLeft') + $(this).data('x') - event.clientX;
				this.scrollTop = $(this).data('scrollTop') + $(this).data('y') - event.clientY;
			}

			//console.log("x: "+Math.round(event.pageX/(32*engine.map.actual_scale))+ " y:"+Math.round(event.pageY/(32*engine.map.actual_scale)));
    }).mouseleave(function (event) {
    	 $(this).data('down', false);
    }).mousewheel(function(event, delta){
			var vel = delta > 0 ? 0.1 : -0.1;
			
			new_scale = engine.map.actual_scale + vel;
			engine.map.scale(new_scale);
			
			return false;
		});
	}
}


$(engine).ajaxStart(function(){
   engine.benchmark.start = new Date();
});

$(engine).ajaxStop(function(){
   engine.benchmark.stop();
});

function distance_of_time_in_words(time){
	var nbr = Math.floor(time / 60);
	return (nbr+":")+(((nbr=(time-(nbr*60)))<10)?"0"+nbr:nbr);
}

function to_radiants(degrees) {
	return (Math.PI/180)*degrees;
}

$.fn.extend({
	act_as_tabs: function(){
		$(this).click(function () {
			var tabs = $(this).parents('ul').find('a');
			$(tabs).removeClass('selected');
			$(this).addClass('selected');

			tabs.each(function () {
				$($(this).attr('href')).hide();
			});

			$($(this).attr('href')).show();
			
			return false;
		});
	},
	
	has_tooltip: function (title) {
		$(this).bind("mouseenter",function (event) {
			var text = $(this).attr('tooltip');
			
			if (text != undefined) { 
				$("#tooltip").html(text);
				$("#tooltip").show();
			}
			
			return false;
		}).mousemove(function (event){
			var y = event.clientY + 10;
			
			if (window.innerHeight < y + $('#tooltip').height() + 20) {
				y = y - 5 - $('#tooltip').height();
			}
			
			var x = event.clientX + 10;
			
			if (window.innerWidth < x + $('#tooltip').width() + 20) {
				x = x - 5 - $('#tooltip').width();
			}
			
			$("#tooltip").css({ top: y+"px", left: x+"px" });
		}).mouseleave(function(){
			$("#tooltip").hide();
		});
	}
});

Array.prototype.unique =
  function() {
    var a = [];
    var l = this.length;
    for(var i=0; i<l; i++) {
      for(var j=i+1; j<l; j++) {
        // If this[i] is found later in the array
        if (this[i] === this[j])
          j = ++i;
      }
      a.push(this[i]);
    }
    return a;
};