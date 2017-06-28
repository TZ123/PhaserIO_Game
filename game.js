var bulletXSpeed = 500;
var direction = 1;
var spaceBar;

function Hero(game, x, y) {
	//call preoloaded sprite
	Phaser.Sprite.call(this, game, x, y,'heros');
	this.anchor.set(-0.1, -3.9);
	this.game.physics.enable(this);
	
	///prevents sprite from leaving canvas
	this.body.collideWorldBounds = true;
	this.animations.add('stop', [0]);
	this.animations.add('run', [0,1,2], 8, true);
	this.animations.add('jump', [1]);
	this.animations.add('fall', [3]);
	
}

Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

//make Hero move left and right
Hero.prototype.move = function(direction) {
	const SPEED = 100;
	this.body.velocity.x = direction * SPEED;
	if(this.body.velocity.x < 0){
		this.scale.x = -1;//make char face way of keypress
		
	}else if (this.body.velocity.x > 0) {
		this.scale.x = 1;
	}
};


//makes hero jump
Hero.prototype.jump = function() {
	const JUMP_SPEED = 600;
	let canJump = this.body.touching.down;
	
	if(canJump) {
		this.body.velocity.y = -JUMP_SPEED;
	}
	
	return canJump;
};

//create small bounce animation
Hero.prototype.bounce = function() {
	const BOUNE_SPEED = 400;
	this.body.velocity.y = -BOUNE_SPEED;
 };

Hero.prototype._getAnimationName  = function() {
	let name = 'stop';
	if (this.body.velocity.y < 0 ) {
		name='jump';
	}else if (this.body.velocity.y >= 0 && !this.body.touching.down) {			 
		name = 'fall';
	}else if(this.body.velocity.x !== 0 && this.body.touching.down) {
		name = 'run';
	}
	//if no conditions met play the stop animation
	return name;
};

Hero.prototype.update = function() {
	let animationName = this._getAnimationName();
    	if (this.animations.name !== animationName) {
        	this.animations.play(animationName);
    	}
};


function BadGuy(game,x,y) {
	Phaser.Sprite.call(this, game, x, y, 'badguy');
	
	//anchor
	this.anchor.set(0.5);
	//animation
	this.animations.add('crawl', [0, 1, 2], 8, true);
    this.animations.add('die', [4,5,6], 6);
    this.animations.play('crawl');
	
	
	this.game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.body.velocity.x = BadGuy.SPEED;
}

BadGuy.SPEED=100;

//inherit from Phaser.Sprite
BadGuy.prototype = Object.create(Phaser.Sprite.prototype);
BadGuy.prototype.constructor = BadGuy;

BadGuy.prototype.update = function() {
	//check for wall hit then reverse
	if (this.body.touching.right || this.body.blocked.right) {
		this.body.velocity.x = -BadGuy.SPEED; //turn left
		
	}else if (this.body.touching.left || this.body.blocked.left) {
		this.body.velocity.x = BadGuy.SPEED;
	};
}

//death upon stomp / shooting
BadGuy.prototype.die = function() {
	this.body.enable = true;
	//calls die animation from above
	this.animations.play('die').onComplete.addOnce(function() {
		this.kill();
	}, this);
};

Bullet = function (game, x, y, direction, speed) {
    Phaser.Sprite.call(this, game, x, y, "bullet"); 
	
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.xSpeed = direction * speed;
};
 
Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;
 
Bullet.prototype.update = function () {
 
 
   
 
    this.body.velocity.y = 0;
    this.body.velocity.x = this.xSpeed;
    if (this.x < 0 || this.x > 2000) {
        this.destroy();
    }
 
};




PlayState = {};


PlayState.init = function () {
    this.game.renderer.renderSession.roundPixels = true;

	this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
		up: Phaser.KeyCode.UP,
		down: Phaser.KeyCode.DOWN,
		spacebar: Phaser.KeyCode.SPACEBAR,
		fireKey: Phaser.KeyCode.SHIFT
    });
	
	this.keys.spacebar.onDown.add(function() {
	let didJump = this.heros.jump();
	if (didJump) {
		this.sfx.jump.play();
	}
	
	},this);

	this.coinCount = 0;
	this.hasKey = false;
};

PlayState.preload = function() {
	this.game.load.json('positions', 'data/data.json');
	this.game.load.image('background', 'assets/images/background.png');
	
	this.game.load.image('ground', 'assets/images/ground.png');
	this.game.load.image('1x1_grass', 'assets/images/1x1_grass.png');
	this.game.load.image('1x1_dirt', 'assets/images/1x1_dirt.png');
	this.game.load.image('4block', 'assets/images/1X4_block.png');
    this.game.load.image('1.5x1_block','assets/images/1.5X1_block.png');
	this.game.load.image('2x1_block', 'assets/images/2X1_block.png');
	this.game.load.image('icon:coin', 'assets/images/coin.png');
	this.game.load.image('invisible-wall', 'assets/images/invisible-wall.png');
	
	this.game.load.spritesheet('coin', 'assets/images/coin-animated.png', 25.01, 30);
	this.game.load.spritesheet('badguy', 'assets/images/badguy.png', 45,76);
	this.game.load.spritesheet('heros', 'assets/images/hero.png', 44.9,63);
	this.game.load.image('cannon', 'assets/images/cannon.png');
	this.game.load.spritesheet('door', 'assets/images/door.png', 170,110);
	this.game.load.image('bullet', 'assets/images/bullet.png');
    this.game.load.image('key', 'assets/images/key.png');
	
	this.game.load.audio('sfx:jump', 'assets/sfx/jump.wav');
	this.game.load.audio('sfx:coin', 'assets/sfx/coin_collect.wav');
	this.game.load.audio('sfx:hero_death', 'assets/sfx/hero_death.wav');
	this.game.load.audio('sfx:enemy_death', 'assets/sfx/enemy_death.wav');
	this.game.load.audio('sfx:laser', 'assets/sfx/laser.wav');
};

PlayState.create = function() {
	//put sfx into key-value pairs
	this.sfx = {
		jump: this.game.add.audio('sfx:jump'),
		coin: this.game.add.audio('sfx:coin'),
		stomp: this.game.add.audio('sfx:enemy_death'),
		die: this.game.add.audio('sfx:hero_death'),
		gunshot: this.game.add.audio('sfx:laser')
	};
  this.game.add.image(0,0, 'background');
//load JSON for positions of elements
  this._loadLevel(this.game.cache.getJSON('positions'));
    
  this._createHud();
};





PlayState.update = function() {
	this._handleCollisions();
	this._handleInput();
	this.coinFont.text = `x ${this.coinCount}`;
};

//collision handler
PlayState._handleCollisions = function() {
	//make badguys stay on platforms
	this.game.physics.arcade.collide(this.badguys, this.platforms);
	//make badguys collide with walls so they dont
	//fall off sides
	this.game.physics.arcade.collide(this.badguys, this.enemyWalls);
	//make heros not fall through platforms
	this.game.physics.arcade.collide(this.heros, this.platforms);
	//make heros overlap with badguys
	this.game.physics.arcade.overlap(this.heros, this.badguys, this._onHeroVsEnemy, null, this);
	this.game.physics.arcade.overlap(this.bullet, this.badguys, this._onBulletVsEnemy, null, this);
	this.game.physics.arcade.overlap(this.bullet, this.platforms, this._onBulletVsPlatform, null, this);
	this.game.physics.arcade.overlap(this.heros, this.coins, this._onHeroVsCoin, null, this);
	this.game.physics.arcade.overlap(this.heros, this.key, this._onHeroVsKey, null, this);
	
	this.game.physics.arcade.overlap(this.heros, this.door, this._onHeroVsDoor,
    
        function (hero, door) {
            return this.hasKey && hero.body.touching.down;
        }, this);
};


PlayState._handleInput = function() {
	if(this.keys.left.isDown) {
		this.heros.move(-1);
		direction = -1;
	}else if (this.keys.right.isDown) {
		this.heros.move(1);
		direction = 1
	}
	else {
		this.heros.move(0);
	};
	
	this.keys.fireKey.onDown.add(PlayState.shootBullet, this);
};



//load in JSON data function and add groups
PlayState._loadLevel = function(data) {
	this.bgDecoration = this.game.add.group();
	this.platforms = this.game.add.group();
	this.coins = this.game.add.group();
	this.badguys = this.game.add.group();
	this.enemyWalls = this.game.add.group();
	this.enemyWalls.visible = false;
	data.platforms.forEach(this._spawnPlatform, this);
	this._spawnCharacters({heros: data.heros, badguys: data.badguys});
	data.coins.forEach(this._spawnCoin, this);
	this._spawnDoor(data.door.x, data.door.y);
	this._spawnKey(data.key.x, data.key.y);
	
	
	const GRAVITY = 1200;
	this.game.physics.arcade.gravity.y = GRAVITY;
};




PlayState.shootBullet = function() {
	this.bullets = this.game.add.group();
	
    this.bullets.enableBody = true;
    this.bullets.enableGravity = false;
		
     if(direction === 1 && this.bullets.length < 5) {
        this.bullet = new Bullet(this.game, this.heros.x + 46, this.heros.y + 280, direction, bulletXSpeed);
		
		this.bullets.add(this.bullet);
	 }else if (direction === -1 && this.bullets.length < 5) {
		   this.bullet = new Bullet(this.game, this.heros.x -65, this.heros.y + 280, direction, bulletXSpeed);
		 
		  this.bullets.add(this.bullet);
	 }
		
    this.sfx.gunshot.play();
		
};

PlayState._spawnPlatform = function (platform) {
	let sprite = this.platforms.create(platform.x, platform.y, platform.image);
	this.game.physics.enable(sprite);
	sprite.body.allowGravity = false;
	sprite.body.immovable = true;
	this._spawnEnemyWall(platform.x, platform.y, 'left');
	this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
            

};

//spawn enemy wall function
PlayState._spawnEnemyWall = function(x,y,side) {
	let sprite = this.enemyWalls.create(x,y, 'invisible-wall');
	sprite.anchor.set(side==='left' ? 1 : 0, 1);

	this.game.physics.enable(sprite);
	sprite.body.immovable =true;
	sprite.body.allowGravity = false;
};



//spawn CHARS function
PlayState._spawnCharacters = function(data) {
	data.badguys.forEach(function(badguy) {
		let sprite = new BadGuy(this.game, badguy.x, badguy.y+10);
		this.badguys.add(sprite);
	}, this);
	
	
	this.heros = new Hero(this.game, data.heros.x,  data.heros.y);
	this.game.add.existing(this.heros);
	
};


PlayState._spawnCoin = function(coin) {
	let sprite = this.coins.create(coin.x, coin.y, 'coin');
	sprite.anchor.set(0.5, 0.5);
	sprite.animations.add('rotate', [0,1,2,3,4,5], 6, true);
	sprite.animations.play('rotate');
	this.game.physics.enable(sprite);
	sprite.body.allowGravity = false;
};

PlayState._spawnDoor = function (x, y) {
    this.door = this.bgDecoration.create(140,497,'door');
    this.game.physics.enable(this.door);
    this.door.body.allowGravity = false;
	console.log(this.door);
	
};


PlayState._spawnKey = function(x,y) {
	this.key = this.bgDecoration.create(1100,320,'key');
	this.key.anchor.set(0.5,0.5);
	this.game.physics.enable(this.key);
	this.key.body.allowGravity = false;
};


//hero vs enemy, battle to the death
PlayState._onHeroVsEnemy = function(heros,enemy) {
	if(heros.body.velocity.y > 0) {
		heros.bounce();
		enemy.die();
		this.sfx.stomp.play();
	}else{
		this.sfx.die.play();
		this.game.state.restart();
	}
};

PlayState._onHeroVsCoin = function (heros, coin) {
    this.sfx.coin.play();
    coin.kill();
	
	this.coinCount++;
	
};

PlayState._onHeroVsKey = function(heros,key) {
	key.kill();
	this.hasKey = true;
};

PlayState._onHeroVsDoor = function(heros,door) {
	this.game.state.restart();
};

PlayState._onBulletVsEnemy = function(bullet, enemy) {
		bullet.kill();
        enemy.destroy();
	    this.sfx.stomp.play();
};

PlayState._onBulletVsPlatform = function(bullet, platform) {
	bullet.kill();
};

PlayState._createHud = function() {
	
	this.coinFont = this.game.add.text(45,15, this.coinCount,{font: "20px Helvetica", fill: "#FFF", align: "center"});
	let coinIcon = this.game.make.image(0,0, 'icon:coin');
	this.coinFont.anchor.set(0.5);
	
	
	this.hud = this.game.add.group();
	this.hud.add(coinIcon);
	
	this.hud.add(this.coinFont);
	this.hud.position.set(10,10);
};


window.onload = function() {
	let game = new Phaser.Game(1360, 664, Phaser.AUTO, 'game');
	game.state.add('play', PlayState);
	game.state.start('play');
};



