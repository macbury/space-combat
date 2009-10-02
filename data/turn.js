var turn_end = new Date().getTime() + engine.turns.turn_time;
engine.turns.switchToPlayer(1+Math.round(Math.random()*2), turn_end);