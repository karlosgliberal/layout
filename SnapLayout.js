﻿enyo.kind({
	name: "enyo.SnappyLayout",
	kind: "DynamicLayout",
	strategyKind: "SnapLayout",
	minStrategyKind: "SnapFitLayout",
	orient: "h",
	createStrategy: function() {
		var r = this.inherited(arguments);
		r.setOrient(this.orient);
		return r;
	},
	measureControl: function(inControl) {
		return this.strategy.measureControl(inControl);
	}
});

enyo.kind({
	name: "enyo.SnapLayout",
	kind: "Layout",
	layoutClass: "enyo-snap-scroll-layout",
	centered: true,
	unit: "px",
	pad: 0,
	//* @protected
	constructor: function(inContainer) {
		this.inherited(arguments);
		this.orientChanged();
	},
	setOrient: function(inOrient) {
		this.orient = inOrient;
		this.orientChanged();
	},
	orientChanged: function() {
		var h = this.orient == "h";
		this.measure = h ? "width" : "height";
		this.transform = h ? "translateX" : "translateY";
		this.offExtent = h ? "bottom" : "right";
	},
	// static-y property based layout
	flow: function() {
		var s = (this.container.pad||0) + this.unit;
		var b = {top: s, left: s};
		b[this.offExtent] = s;
		for (var i=0, c$ = this.container.children, c; c=c$[i]; i++) {
			// place offff screen (what about using display: none?)
			this.applyTransform(c, "-200%");
			b[this.measure] = this.calcMeasuredBound(c);
			c.setBounds(b, "");
		}
	},
	calcMeasuredBound: function(inControl) {
		var m = inControl[this.measure];
		return Number(m) == m ? m+this.unit : m;
	},
	// dynamic-y measure based layout
	reflow: function() {
		var offset = this.container.layoutOffset || 0;
		var cb = this.container.getBounds()[this.measure];
		var li = this.container.layoutIndex || 0;
		var b = !this.centered ? 0 : (cb - this.measureControl(this.container.children[li])) / 2;
		var o = offset + b;
		// layout out foward from offset until screen is filled
		for (var i=li || 0, c$ = this.container.children, c; c=c$[i]; i++) {
			this.applyTransform(c, o + "px", true);
			o += this.measureControl(c);
			if (o > cb) {
				break;
			}
		}
		// layout out backward from offset until screen is filled
		o = offset + b;
		if (o > 0) {
			for (var i=li-1, c$ = this.container.children, c; c=c$[i]; i--) {
				o -= this.measureControl(c);
				this.applyTransform(c, o+"px", true);
				if (o < 0) {
					break;
				}
			}
		}
	},
	applyTransform: function(inControl, inValue, inApply) {
		var t = this.transform + "(" + inValue + ")";
		var ds = inControl.domStyles;
		ds["-webkit-transform"] = ds["-moz-transform"] = ds["-ms-transform"] = ds["transform"] = t;
		if (inApply && inControl.hasNode()) {
			var s = inControl.node.style;
			s.webkitTransform = s.MozTransform = s.msTransform = s.transform = t;
		}
	},
	measureControl: function(inControl) {
		return inControl.getBounds()[this.measure] + (this.container.pad || 0) * 2;
	}
});

enyo.kind({
	name: "enyo.SnapFitLayout",
	kind: "SnapLayout",
	calcMeasuredBound: function(inControl) {
		return "100%";
	}
});

enyo.kind({
	name: "enyo.HSnapLayout",
	kind: enyo.SnapLayout,
	orient: "h"
});

enyo.kind({
	name: "enyo.VSnapLayout",
	kind: enyo.SnapLayout,
	orient: "v"
});

enyo.kind({
	name: "HSnap",
	kind: "Control",
	layoutKind: "HSnapLayout"
});

enyo.kind({
	name: "VSnap",
	kind: "Control",
	layoutKind: "VSnapLayout"
});