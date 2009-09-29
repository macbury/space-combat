$(document).ready(function () {
	
	engine.building.add({
		title: "Budowa: Krążownik Aurora",
		time: 10+Math.round(Math.random()*120),
		image_url: "images/ui/icons/krazownik.png",
		id: 1,
		complete_url: 'complete.js',
		cancel_url: 'cancel.js'
	});

	engine.building.add({
		title: "Badanie: Pole Warp",
		time: 600,
		image_url: "images/ui/icons/worp.png",
		id: 0,
		complete_url: 'complete.js',
		cancel_url: 'cancel.js'
	});

	engine.building.add({
		title: "Budowa: Myśliwiec Hydra",
		time: 23,
		image_url: "images/ui/icons/mysliwiec.png",
		id: 2,
		complete_url: 'complete.js',
		cancel_url: 'cancel.js'
	});
	
	engine.building.add({
		title: "Budowa: Statek kolonizacyjny Vega",
		time: 10+Math.round(Math.random()*80),
		image_url: "images/ui/icons/vega.png",
		id: 3,
		complete_url: 'complete.js',
		cancel_url: 'cancel.js'
	});
	
	engine.players.add({
		login: 'MacBury',
		status: STATUS_ONLINE,
		id: 1,
		color: "rgba(0, 255, 255, 0.7)",
		avatar: "http://0.gravatar.com/avatar/4d346581a3340e32cf93703c9ce46bd4?s=30&d=monsterid"
	});
	
	engine.players.current_player_id = 1;
	
	engine.players.add({
		login: 'Maru',
		status: STATUS_AFK,
		id: 2,
		color: "rgba(255, 255, 0, 0.7)",
		avatar: "http://2.gravatar.com/avatar/47a39c211cc16924d9fc6ad6249fb260?s=30&d=wavatar"
	});
	
	engine.players.add({
		login: 'Dul',
		status: STATUS_OFFLINE,
		id: 3,
		color: "rgba(255, 0, 255, 0.7)",
		avatar: "http://2.gravatar.com/avatar/4e84843ebff0918d72ade21c6ee7b1e4?s=30&d=wavatar"
	});
	
	for (var i=0; i < 90; i++) {
		var marker = { x: 0, y: 0, title: "", user_id: 0 };
		
		marker.x = Math.round(30 + Math.random() * (engine.map.width - 60));
		marker.y = Math.round(100 + Math.random() * (engine.map.height - 130));
		marker.title = '<h3>PX-'+(100+Math.round(Math.random() * 100))+'</h3><br /><img src="images/stars/star'+Math.round(1+Math.random()*4)+'.png" /><br /><b>Planet:</b> '+Math.round(1+Math.random()*9)+'<br /><b>Zdatność do życia</b> '+Math.round(50+Math.random()*50)+'%<br /><b>Pozycja:</b>	['+marker.x+':'+marker.y+']' ;

		
		engine.map.markers.push(marker);
	};
	
	engine.status.update_url = 'test.js';
	
	engine.resources.setValue('energy', 5000);
	engine.resources.setValue('antimatter', 250);
	engine.resources.setValue('metal', 1000);
		
	engine.initialize();
});