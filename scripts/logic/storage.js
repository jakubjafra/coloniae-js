/*

storage.js

*/

// trzeba zrobić porządek z tymi slotami... nie podoba mi się trochę bałagan z tymi id'kami
// być może to problem bo nie mam rozpisanych towarów nigdzie ani konkretnych budynków
// w chwili gdy będą towary i budynki konkretne to ten bałagan sam się uprzątnie ???

var Slot =  Class.extend(function(){
	this.type = undefined;
	this.quantity = 0;

	this.constructor = function(type, quantity){
		this.type = (type == undefined ? undefined : type);
		this.quantity = (quantity == undefined ? 0 : quantity);
	}
});

// workshop zwykle bierze kilka substratów (katagoria INPUT_1) i zamienia w jeden produkt (o stałej określonej katagorii OUTPUT)
OUTPUT = 0;
INPUT_1 = 1;
INPUT_2 = 2;

var Storage = Class.extend(function(){
	this.slots = {}; // typeId -> Slot
	this.catagories = {}; // catagoryId -> typeId

	// zwraca iloć towaru o danym typeId
	this.at = function(type){
		return (this.slots[type] != undefined ? this.slots[type].quantity : 0);
	};

	// zwraca ilość towaru o danej catagoryId
	this.of = function(catagory){
		return (this.catagories[catagory] != undefined ? this.at(this.catagories[catagory]) : 0);
	};

	// zwraca typeId na podstawie catagoryId
	this.special = function(catagory){
		return this.catagories[catagory];
	};

	// ~~~

	this.add = function(type, quantity){
		if(type instanceof Slot){
			quantity = type.quantity;
			type = type.type;
		}

		if(this.slots[type] == undefined)
			this.slots[type] = new Slot(type, quantity);
		else
			this.slots[type].quantity += quantity;
	};

	// podanie jako quantity liczby Infinity powoduje wyzerowanie stanu slota
	// ret -> stan magazynu przed operacją
	this.remove = function(type, quantity){
		if(type instanceof Slot){
			quantity = type.quantity;
			type = type.type;
		}

		if(this.slots[type] == undefined)
			return false;

		var wasQuantity = this.slots[type].quantity;

		if(quantity == Infinity)
			this.slots[type].quantity = 0;
		else{
			if(quantity > this.slots[type].quantity)
				return this.remove(type, Infinity);

			this.slots[type].quantity -= quantity;
		}

		return wasQuantity;
	};

	// podanie jako quantity Infinity powoduje przesunięcie całej zawartości slota
	this.transferTo = function(dest, type, quantity){
		console.assert(dest instanceof Storage);
		// (remove ma assert)

		dest.add(type, this.remove(type, quantity));
	}
});