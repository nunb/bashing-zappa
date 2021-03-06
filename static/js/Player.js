function Player(engine, id, playername) {
	Entity.call(this, engine);
	this.id = id;
	this.x = px2m(200 + Math.random() * (engine.ctx.canvas.width - 400));
	this.y = px2m(200 + Math.random() * (engine.ctx.canvas.height - 400));
	this.angle = 0;
	this.radius = px2m(32);
	this.force = new b2Vec2(0, 0);
	this.forceSize = engine.ctx.canvas.height / 200;
	this.playername = playername;
	this.collisionAudioIndex = 0;
	this.label = null;
	this.deadTime = null;
	this.score = 0;
	this.ballImgs = [];
	for (var i = 1; i <= 5; i++) {
		this.ballImgs[i] = new Image();
		this.ballImgs[i].src = '/img/units/wreckingball'+i+'.png'
	}
	
	this.engineImgs = [];	
	for (var i = 0; i < 20; i++) {
		this.engineImgs[i] = new Image();
		this.engineImgs[i].src = '/img/units/unit'+(i+1)+'.png';
	}
	this.engineImg = this.engineImgs[this.id % 20];

	this.explosionImgs = [];
	for (var i = 1; i <= 2; i++) {
		this.explosionImgs[i] = new Image();
		this.explosionImgs[i].src = '/img/units/explosion'+i+'.png'
	}
}
Player.prototype = new Entity();
Player.prototype.constructor = Player;

Player.prototype.playSoundOfDeath = function() {
	this.collisionAudioIndex++;
	document.getElementById("death" + (this.collisionAudioIndex % 10)).play();	
}

Player.prototype.update = function(state) {
	var density = this.body.GetFixtureList().GetDensity();
	
	if(density < 0.1) {
	    if (this.deadTime == null) {
	        this.isDead = true;
			this.deadTime = Date.now();
		}
		
		if (Date.now() - this.deadTime > 1000 && this.isDead == true) {
			// TODO remove from box2d
			console.log('Removing player from physics');
			this.removeFromWorld = true;
		}
		
		return;
	}
	
	this.x = state.x;
	this.y = state.y;
	this.angle = state.angle;

	this.body.ApplyForce(
		new b2Vec2(
			this.forceSize * this.force.x * density,
			this.forceSize * this.force.y * density),
		this.body.GetPosition()
	);
	
	Entity.prototype.update.call(this);
};

Player.prototype.draw = function(ctx) {
	var timeDeath = Date.now() - this.deadTime;
	if(this.deadTime != null && timeDeath < 1000) {
		$("#p" + this.id).remove();
		this.playSoundOfDeath();
		var explosionImage = this.explosionImgs[1];
		
		if ((timeDeath > 200 && timeDeath < 400) || 
			(timeDeath > 600 && timeDeath < 800)) {
				explosionImage = this.explosionImgs[2];
		} else {
			explosionImage = this.explosionImgs[1];
		}
		
		ctx.drawImage(explosionImage,
			m2px(this.x) - (explosionImage.width /2),
			m2px(this.y) - (explosionImage.height /2));
	} else {
	    if (this.isDead) return;
	    
		var forceMultiplier = 1;
		// Cable
		ctx.beginPath();
		ctx.moveTo(m2px(this.x), m2px(this.y));
		var enginePosX = m2px(this.x) + this.force.x * forceMultiplier;
		var enginePosY = m2px(this.y) + this.force.y * forceMultiplier;
		ctx.lineTo(enginePosX, enginePosY);
		ctx.lineWidth = 2;
		ctx.stroke();
	
		ctx.save();
		ctx.translate(m2px(this.x), m2px(this.y));

		// Ball
		ctx.rotate(this.angle);
		var density = this.body.GetFixtureList().GetDensity();
		var ballImg = this.ballImgs[1];
		if(density < 0.2) ballImg = this.ballImgs[5];
		else if(density < 0.4) ballImg = this.ballImgs[4];
		else if(density < 0.6) ballImg = this.ballImgs[3];
		else if(density < 0.8) ballImg = this.ballImgs[2];
		ctx.drawImage(ballImg, - (ballImg.width /2), - (ballImg.height /2) , ballImg.width, ballImg.height);
		ctx.rotate(-this.angle);

		// Engine
		ctx.translate(this.force.x * forceMultiplier, this.force.y * forceMultiplier);
		ctx.rotate(Math.atan2(this.force.y, this.force.x));
	
		ctx.drawImage(this.engineImg, - (this.engineImg.width /2), - (this.engineImg.height /2) , this.engineImg.width, this.engineImg.height);

		ctx.restore();
	}
	
	// Name
	if (!this.label) {
		this.label = $("<div/>", { id: "p" + this.id, "text": this.playername, "class": "playerLabel" });
		$(document.body).append(this.label);
	}
	this.label.css({ "top": m2px(this.x), "left": m2px(this.y) });
	this.label.text(this.playername + '(' + this.score + ')');
};



