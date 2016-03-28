var json_syntax_analis = (function () {
    var at, 
        ch,
        text,
		/*хранит пробелы*/
		whitespace = "",		
        error = function (m) {
        // Call error when something is wrong.
        throw {
            name:    'SyntaxError',
            message: m,
            at:      at,
            text:    text
           };
        },

        next = function (c) {
            if (c && c !== ch) {
                error("Expected '" + c + "' instead of '" + ch + "'");
            }
            ch = text.charAt(at);
            at += 1;
            return ch;
        },

        number = function () {
            var number,
                string = '';

            if (ch === '-') {
                string = '-';
                next('-');
            }
            while (ch >= '0' && ch <= '9') {
                string += ch;
                next();
            }
            if (ch === '.') {
                string += '.';
                while (next() && ch >= '0' && ch <= '9') {
                    string += ch;
                }
            }
            if (ch === 'e' || ch === 'E') {
                string += ch;
                next();
                if (ch === '-' || ch === '+') {
                    string += ch;
                    next();
                }
                while (ch >= '0' && ch <= '9') {
                    string += ch;
                    next();
                }
            }
            number = +string;
            if (!isFinite(number)) {
                error("Bad number");
            } else {
                return number;
            }
        },

        string = function () {
            var hex,
                i,
                string = '',
                uffff;
            if (ch === '"') {
                while (next()) {
                    if (ch === '"') {
                        next();
                        return string;
                    }
                    if (ch === '\\') {
                        next();
                        if (ch === 'u') {
                            uffff = 0;
                            for (i = 0; i < 4; i += 1) {
                                hex = parseInt(next(), 16);
                                if (!isFinite(hex)) {
                                    break;
                                }
                                uffff = uffff * 16 + hex;
                            }
                            string += String.fromCharCode(uffff);
                        } else if (typeof escapee[ch] === 'string') {
                            string += escapee[ch];
                        } else {
                            break;
                        }
                    } else {
                        string += ch;
                    }
                }
            }
            error("Bad string");
        },

        white = function () {

            while (ch && ch <= ' ') {
                next();
            }
        },

        word = function () {
            switch (ch) {
            case 't':
                next('t');
                next('r');
                next('u');
                next('e');
                return true;
            case 'f':
                next('f');
                next('a');
                next('l');
                next('s');
                next('e');
                return false;
            case 'n':
                next('n');
                next('u');
                next('l');
                next('l');
                return null;
            }
            error("Unexpected '" + ch + "'");
        },

        value,

        array = function () {
            var array = [];

            if (ch === '[') {
                next('[');
                white();
                if (ch === ']') {
                    next(']');
                    return;
                }
                while (ch) {
                    array.push(value());
					if(typeof array[array.length-1] == 'string' && typeof array[array.length-1]!='undefined'){
                    add(whitespace);					
					add("\"");
					add(array[array.length-1]);
					add("\"");
					}else if(typeof array[array.length-1] == 'number' && typeof array[array.length-1]!='undefined'){
					add(whitespace);
					add(object[key]);
					}
                    white();
                    if (ch === ']') {
                        next(']');
						whitespace = whitespace.slice(0,-4);
						add('\n');
						add(whitespace);
						add(']');
                        return;
                    }
                    next(',');
					add(',\n');
                    white();
                }
            }
            error("Bad array");
        },

        object = function () {
            var key,
                object = {};
            if (ch === '{') {
                next('{');
                white();
                if (ch === '}') {
                    next('}');
                    return object;
                }
                while (ch) {
                    key = string();
                    white();
                    next(':');
					add(whitespace);
					add("\"");
					add(key);
					add("\"");
					add(":");
                    if (Object.hasOwnProperty.call(object, key)) {
                        error('Duplicate key "' + key + '"');
                    }
					object[key] = value(":");
                    white();
                    if (ch === '}') {
                        next('}');
						if(typeof (object[key]) == 'string' && typeof (object[key])!='undefined'){
						   add(object[key]);
						}
						if(typeof (object[key]) == 'number' && typeof (object[key])!='undefined'){
						   add(object[key]);
						}
						whitespace = whitespace.slice(0,-4);
						add('\n'); 
						add(whitespace); 
						add('}');
                        return object;
                    }
					if(typeof (object[key]) == 'string' && typeof (object[key])!='undefined'){				
					add("\"");
					add(object[key]);
					add("\"");
					}else if(typeof (object[key]) == 'number' && typeof (object[key])!='undefined'){
					add(object[key]);
					}
                    next(',')
					add(',\n');
                    white();
                }
            }
            error("Bad object");
        };

    value = function (lastChar) {
        white();
        switch (ch) {
        case '{':
		            if(lastChar!=":"){
		                add(whitespace);
					}
					add(ch);
					add("\n");
					whitespace = whitespace + "    ";
            return object();
        case '[':
		            if(lastChar!=":"){
		                add(whitespace);
					}
			add(ch);
			add("\n");
			whitespace = whitespace + "    ";
            return array();
        case '"':
            return string();
        case '-':
            return number();
        default:
            return ch >= '0' && ch <= '9' 
                ? number() 
                : word();
        }
    };

    return function (source, reviver) {
        var result;

        text = source;
        at = 0;
        ch = ' ';
        result = value();
        white();
        if (ch) {
            error("Syntax error");
        }
    };
}());
