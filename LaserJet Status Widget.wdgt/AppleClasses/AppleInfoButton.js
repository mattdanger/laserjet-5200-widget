function AppleInfoButton(flipper, front, foregroundStyle, backgroundStyle, onclick) {
	/* Read-write properties */
    this.onclick = onclick;
    
    /* Internal */
	this._front = front;
	this._flipper = flipper;
	this._flipLabel = document.createElement("img");
	this._flipLabel.width = 13;
	this._flipLabel.height = 13;
	this._flipLabel.setAttribute("alt", "Info");
	this._flipCircle = document.createElement("div");
	flipper.appendChild(this._flipCircle);
	flipper.appendChild(this._flipLabel);
    this._labelshown = false;
	
	// For JavaScript event handlers
	var _self = this;
	
	this._updateOpacity = function(animation, now, first, done)
	{
		_self._flipLabel.style.opacity = now;
	}
	
	this._animationComplete = function()
	{
		delete _self._animation;
		delete _self._animator;
	}
	
	this._frontMove = function(event)
	{
		if (_self._outdelay !== undefined)
		{
			clearInterval(_self._outdelay);
			delete _self._outdelay;
		}
		if (_self._labelshown)
			return;
		
		var from = 0.0;
		var duration = 500;
		if (_self._animation !== undefined)
		{
			from = _self._animation.now;
			duration = (new Date).getTime() - _self._animator.startTime;
			_self._animator.stop();
		}
		
		_self._labelshown = true;
		
		var animator = new AppleAnimator(duration, 13);
		animator.oncomplete = _self._animationComplete;
		_self._animator = animator;
		
		_self._animation = new AppleAnimation(from, 1.0, _self._updateOpacity);
		animator.addAnimation(_self._animation);
		animator.start();
	}
	
	this._frontOutDelay = function(event)
	{
		_self._outdelay = setInterval(_self._frontOut, 0, _self);
	}
	
	this._frontOut = function(_self)
	{
		if (_self._outdelay !== undefined)
		{
			clearInterval(_self._outdelay);
			delete _self._outdelay;
		}
		if (!_self._labelshown)
			return;
		
		var from = 1.0;
		var duration = 500;
		if (_self._animation !== undefined)
		{
			from = _self._animation.now;
			duration = (new Date).getTime() - _self._animator.startTime;
			_self._animator.stop();
		}
		
		var animator = new AppleAnimator(duration, 13);
		animator.oncomplete = _self._animationComplete;
		_self._animator = animator;
		
		_self._animation = new AppleAnimation(from, 0.0, _self._updateOpacity);
		animator.addAnimation(_self._animation);
		animator.start();
	
		_self._labelshown = false;
	}
	
	this._labelOver = function(event)
	{
		_self._flipCircle.style.visibility = "visible";
	}
	
	this._labelOut = function(event)
	{
		_self._flipCircle.style.visibility = "hidden";
	}
	
	this._labelClicked = function(event)
	{
		_self._flipCircle.style.visibility = "hidden";
		
		try {
			if (_self.onclick != null)
				_self.onclick(event);
		} catch(ex) {
			throw ex;
		} finally {
			event.stopPropagation();
    	    event.preventDefault();
    	}
	}

	// Set up style
	var style = this._flipLabel.style;
	style.position = "absolute";
	style.top = 0;
	style.left = 0;
	style.opacity = 0;
	
	style = this._flipCircle.style;
	style.position = "absolute";
	style.top = 0;
	style.left = 0;
	style.width = "13px";
	style.height = "13px";
	this.setCircleOpacity(0.25);
	style.visibility = "hidden";
	
	this.setStyle(foregroundStyle, backgroundStyle);
	
	this._front.addEventListener("mousemove", this._frontMove, true);
	this._front.addEventListener("mouseout", this._frontOutDelay, true);
	
	this._flipper.addEventListener("click", this._labelClicked, true);
	this._flipper.addEventListener("mouseover", this._labelOver, true);
	this._flipper.addEventListener("mouseout", this._labelOut, true);
}

AppleInfoButton.prototype.remove = function()
{
	this._front.removeEventListener("mousemove", this._frontMove, true);
	this._front.removeEventListener("mouseout", this._frontOutDelay, true);
	
	this._flipper.removeEventListener("click", this._labelClicked, true);
	this._flipper.removeEventListener("mouseover", this._labelOver, true);
	this._flipper.removeEventListener("mouseout", this._labelOut, true);
	
	var parent = this._flipLabel.parentNode;
	parent.removeChild(this._flipCircle);
	parent.removeChild(this._flipLabel);
}

AppleInfoButton.prototype.setStyle = function(foregroundStyle, backgroundStyle)
{
	this._flipLabel.src = "file:///System/Library/WidgetResources/ibutton/" + foregroundStyle + "_i.png";
	this._flipCircle.style.background = "url(file:///System/Library/WidgetResources/ibutton/" + backgroundStyle + "_rollie.png) no-repeat top left";
}

AppleInfoButton.prototype.setCircleOpacity = function(opacity)
{
	this._flipCircle.style.opacity = opacity;
}
