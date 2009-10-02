$(document).ready(function () {
	
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
		status: STATUS_ONLINE,
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
	
	engine.map.calculateLines();

	for (var i=0; i < 90; i++) {
		var marker = { 
			x: 1 + Math.round(Math.random() * (engine.map.lines_x - 2)), 
			y: 1 + Math.round(Math.random() * (engine.map.lines_y - 2)), 
			title: "", 
			user_id: 0,
			id: i+1
		};

		marker.image = 'images/stars/star'+Math.round(1+Math.random()*4)+'.png';
		marker.name = 'PX-'+(100+Math.round(Math.random() * 100));
		marker.title = '<h3>'+marker.name+'</h3><br /><img src="'+marker.image+'" /><br /><b>Planet:</b> '+Math.round(1+Math.random()*9)+'<br /><b>Zdatność do życia</b> '+Math.round(50+Math.random()*50)+'%<br /><b>Pozycja:</b>	['+marker.x+':'+marker.y +']' ;

		
		engine.map.stars.push(marker);
	};
	
	engine.status.update_url = 'test.js';
	
	engine.turns.setTurnTime(7 * 60 + 30);
	engine.turns.nextTurn();
	
	engine.resources.setValue('energy', 1000);
	engine.resources.setValue('antimatter', 250);
	engine.resources.setValue('metal', 500);
		
	engine.initialize();
});