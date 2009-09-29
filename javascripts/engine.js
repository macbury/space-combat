var STATUS_ONLINE = 3;
var STATUS_AFK = 2;
var STATUS_DND = 1;
var STATUS_OFFLINE = 0;

var engine = {
	
	map: {
		width: 2304,
		height: 1024,
		texture: "tiles/StarsMap1.png",
		dom_id: "#game_map",
		actual_scale: 0.45,
		
		markers: [],
		
		markersForUser: function(user_id){
			return $.grep(this.markers, function (marker, index) {
				return (marker.user_id == user_id);
			})
		},
		
		load: function(){
			var texture = $('<img/>');
			
			texture.attr('src', this.texture).addClass('background');
			$(this.dom_id).append(texture);
			
			var canvas = $('<canvas>');
			$(this.dom_id).append(canvas);
			
			this.scale();
		},
		
		scale: function(new_scale){
			
			if (new_scale != undefined) {
				this.actual_scale = new_scale;
			}
			
			var width = Math.round(this.width*this.actual_scale);
			var height = Math.round(this.height*this.actual_scale);
			
			//var left = $(engine.map.dom_id).scrollLeft();
			//var top = $(engine.map.dom_id).scrollTop();
			
			$('.background', this.dom_id).css({
				width: width,
				height: height
			});
			
			$('canvas', this.dom_id).attr('width',width)
															.attr('height', height);
			
			//var left = Math.round($(engine.map.dom_id).attr('scrollWidth')*this.actual_scale);
			//var top = Math.round($(engine.map.dom_id).attr('scrollHeight')*this.actual_scale);
			
			//$(engine.map.dom_id).scrollLeft(Math.round(left*this.actual_scale));
			//$(engine.map.dom_id).scrollTop(Math.round(top*this.actual_scale));
			
			this.update_markers();
			this.renderPaths();
		},
		
		renderPaths: function(){
			var canvas = $('canvas', this.dom_id)[0].getContext("2d");
			var self = this;
			
			canvas.clearRect(0,0,this.width*this.actual_scale, this.height*this.actual_scale);
			
			canvas.lineWidth = 2;
			canvas.lineCap = 'round';
			
			$.each(engine.players.list, function () {
				var player = this;
				
				var markers = self.markersForUser(player.id).sort(function (a,b) {
					var x = Math.abs(a.x);
					var y = Math.abs(a.y);
					var nx = Math.abs(b.x);
					var ny = Math.abs(b.y);

					return (Math.min(x,nx) == x && Math.min(y,nx) == y) ? 1 : -1
				});

				canvas.strokeStyle = player.color;

				for (var i=1; i < markers.length; i++) {
					canvas.beginPath();

					var from = markers[i-1];
					var to = markers[i];

					canvas.moveTo(from.x*self.actual_scale,from.y*self.actual_scale);
					canvas.lineTo(to.x*self.actual_scale,to.y*self.actual_scale);

					canvas.stroke();
				}
			});
						
		},
		
		update_markers: function(){
			for (var i=0; i < this.markers.length; i++) {
				var self = this.markers[i];
				
				if (this.markers[i].dom_id == undefined) {
					var marker = $('<img />');
					var new_id = 'marker_'+(new Date() - 1);
					
					marker.attr('src', self.user_id == 1 ? 'images/conquest-marker.png' : 'images/solar-marker.png')
								.attr('id', new_id)
								.attr('tooltip', self.title)
								.data('marker_id', i);
					
					
					self.dom_id = "#"+new_id;
					$(this.dom_id).append(marker);
					
					marker.click(function () {
						engine.map.markers[$(this).data('marker_id')].user_id = engine.players.current_player().id;
						engine.events.add({
							body: "Kolonizacja PX-106 dobiegła końca"
						});
						engine.map.renderPaths();
					});

					marker.has_tooltip();
				}
				
				
				
				$(self.dom_id).css({
					left: Math.round(self.x*this.actual_scale) - 8,
					top: Math.round(self.y*this.actual_scale) - 8
				});
			};
		},
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
					
					b.start_time = b.time;
					b.dom_id = new_id;
					
					link.attr('tooltip', 'Klinkij aby anulować')
					link.has_tooltip();
				}
				
				var progress = $('#'+b.dom_id);
				b.time--;
				progress.find('span').text(distance_of_time_in_words(b.time));
				
				var canvas = $(progress).find('canvas')[0].getContext("2d");
				canvas.clearRect(0,0,30,30);
				
				try {
					canvas.drawImage(image,0,0,30,30);
				} catch(err) {
					console.log(err.message);
				}
				
				canvas.fillStyle = "rgba(0,0,0, 0.7)";
				
				var y = (b.time * 100) / b.start_time * 0.01;
				canvas.fillRect(0,0,30,Math.round(30*y));
				
				if (b.time < 15) {
					if (b.time % 2 == 0) {
						progress.find('a').css({ background: "rgba(255, 0 ,0 ,0.4)" });
					}else{
						progress.find('a').css({ background: "rgba(255, 0 ,0 ,0.0)" });
					}
				}
				
				if (b.time == 0) {
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
					
					if (building.time == 0) {
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
				
				$(self.dom_id).append(html);
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
	
	initialize: function() {
		this.configGameMap();
		this.building.process();
		this.resources.process();
		this.status.update();
		this.chat.initialize();
		this.events.initialize();
		
		$('body').append($('<div class="ui-box tooltip" id="tooltip">'));
		$('.ui-menu a, .ui-tabs a').act_as_tabs();
		$('.ui-resources li, .ui-latency').has_tooltip();
		
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
    }).mouseleave(function (event) {
    	 $(this).data('down', false);
    }).mousewheel(function(event, delta){
			var vel = delta > 0 ? 0.05 : -0.05;
			
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