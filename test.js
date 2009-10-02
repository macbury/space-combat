//console.log('TEST');
//engine.players.current_player().status = 0;
//engine.players.update();
//engine.map.markers[Math.round(Math.random()*engine.map.markers.length-1)].user_id = engine.players.list[Math.round(Math.random()*engine.players.list.length)].id;
//engine.map.renderPaths();
//engine.chat.add({
//	user_id: 1,
//	body: "Co robisz? Test! asdasldlkasmn asdas asdasd "
//});

engine.resources.energy += Math.round(Math.random()*20);
engine.resources.antimatter += Math.round(Math.random()*2);
engine.resources.metal += Math.round(Math.random()*10);
engine.resources.process();