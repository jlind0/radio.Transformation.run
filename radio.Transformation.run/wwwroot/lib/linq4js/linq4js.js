"use strict";
var Linq4JS;
(function (Linq4JS) {
    var GeneratedEntity = /** @class */ (function () {
        function GeneratedEntity() {
        }
        return GeneratedEntity;
    }());
    Linq4JS.GeneratedEntity = GeneratedEntity;
})(Linq4JS || (Linq4JS = {}));
var Linq4JS;
(function (Linq4JS) {
    var EvaluateCommand = /** @class */ (function () {
        function EvaluateCommand(command) {
            var identifier = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                identifier[_i - 1] = arguments[_i];
            }
            this.SplitRegex = [];
            this.Finder = [];
            this.Command = command;
            for (var _a = 0, identifier_1 = identifier; _a < identifier_1.length; _a++) {
                var id = identifier_1[_a];
                var sSplitRegex = void 0;
                var sFinder = void 0;
                if (id.indexOf("{x}") !== -1) {
                    if (id.indexOf("{x}") === id.length - 3) {
                        sSplitRegex = "\\b" + id.replace(" {x}", "") + "\\b";
                        sFinder = "\\b" + id.replace(" {x}", "\\b (.*)");
                    }
                    else {
                        sSplitRegex = "\\b" + id.replace(" {x}", "\\b .*? \\b") + "\\b";
                        sFinder = "\\b" + id.replace(" {x} ", "\\b (.*) \\b") + "\\b";
                    }
                }
                else {
                    sSplitRegex = "\\b" + id + "\\b";
                    sFinder = "\\b" + id + "\\b";
                }
                this.Finder.push(new RegExp(sFinder, "i"));
                this.SplitRegex.push(new RegExp(sSplitRegex, "gi"));
            }
        }
        return EvaluateCommand;
    }());
    Linq4JS.EvaluateCommand = EvaluateCommand;
    var EvaluateCommandResult = /** @class */ (function () {
        function EvaluateCommandResult(cmd, fn) {
            this.Command = cmd;
            this.DynamicFunction = fn;
        }
        return EvaluateCommandResult;
    }());
    Linq4JS.EvaluateCommandResult = EvaluateCommandResult;
})(Linq4JS || (Linq4JS = {}));
var Linq4JS;
(function (Linq4JS) {
    var Helper = /** @class */ (function () {
        function Helper() {
        }
        Helper.ConvertStringFunction = function (functionString, noAutoReturn, noBracketReplace) {
            if (functionString.length === 0) {
                throw new Error("Linq4JS: Cannot convert empty string to function");
            }
            var varnameString = functionString
                .substring(0, functionString.indexOf("=>"))
                .split(" ").join("")
                .split("(").join("")
                .split(")").join("");
            var varnames = varnameString.split(",");
            var func = functionString
                .substring(functionString.indexOf("=>") + ("=>").length);
            if (noBracketReplace == null || noBracketReplace === false) {
                func.replace("{", "").replace("}", "");
            }
            func.split(".match(//gi)").join("");
            if (noAutoReturn == null || noAutoReturn === false) {
                /*No return outside of quotations*/
                if (func.match(/return(?=([^\"']*[\"'][^\"']*[\"'])*[^\"']*$)/g) == null) {
                    func = "return " + func;
                }
            }
            return Function.apply(void 0, varnames.concat([func]));
        };
        Helper.ConvertFunction = function (testFunction, noAutoReturn, noBracketReplace) {
            var result;
            if (typeof testFunction === "function") {
                result = testFunction;
            }
            else if (typeof testFunction === "string") {
                result = Linq4JS.Helper.ConvertStringFunction(testFunction, noAutoReturn, noBracketReplace);
            }
            else {
                throw new Error("Linq4JS: Cannot use '" + testFunction + "' as function");
            }
            return result;
        };
        Helper.OrderCompareFunction = function (valueSelector, a, b, invert) {
            var value_a = valueSelector(a);
            var value_b = valueSelector(b);
            var type_a = typeof value_a;
            var type_b = typeof value_b;
            if (type_a === "string" && type_a === type_b) {
                var value_a_string = value_a;
                value_a_string = value_a_string.toLowerCase();
                var value_b_string = value_b;
                value_b_string = value_b_string.toLowerCase();
                if (value_a_string > value_b_string) {
                    return invert === true ? -1 : 1;
                }
                else if (value_a_string < value_b_string) {
                    return invert === true ? 1 : -1;
                }
                else {
                    return 0;
                }
            }
            else if (type_a === "number" && type_a === type_b) {
                var value_a_number = value_a;
                var value_b_number = value_b;
                return invert === true ? value_b_number - value_a_number : value_a_number - value_b_number;
            }
            else if (type_a === "boolean" && type_a === type_b) {
                var value_a_bool = value_a;
                var value_b_bool = value_b;
                if (value_a_bool === value_b_bool) {
                    return 0;
                }
                else {
                    if (invert === true) {
                        return value_a_bool ? 1 : -1;
                    }
                    else {
                        return value_a_bool ? -1 : 1;
                    }
                }
            }
            else {
                if (type_a === "undefined" && type_a === type_b) {
                    return 0;
                }
                else if (type_a === "undefined") {
                    return invert ? 1 : -1;
                }
                else if (type_b === "undefined") {
                    return invert ? -1 : 1;
                }
                return 0;
            }
        };
        Helper.SplitCommand = function (command) {
            var splitIndexes = [];
            for (var _i = 0, _a = this.Commands; _i < _a.length; _i++) {
                var cmd = _a[_i];
                for (var _b = 0, _c = cmd.SplitRegex; _b < _c.length; _b++) {
                    var split = _c[_b];
                    while (true) {
                        var result = split.exec(command);
                        if (result != null) {
                            splitIndexes.push(result.index);
                        }
                        else {
                            break;
                        }
                    }
                }
            }
            var parts = [];
            splitIndexes = splitIndexes.Distinct().OrderBy(function (x) { return x; });
            for (var i = 0; i < splitIndexes.length; i++) {
                if (i === splitIndexes.length - 1) {
                    parts.push(command.substr(splitIndexes[i]));
                }
                else {
                    parts.push(command.substr(splitIndexes[i], splitIndexes[i + 1] - splitIndexes[i]));
                }
            }
            return parts;
        };
        Helper.MatchCommand = function (cmd) {
            for (var _i = 0, _a = this.Commands; _i < _a.length; _i++) {
                var command = _a[_i];
                for (var _b = 0, _c = command.Finder; _b < _c.length; _b++) {
                    var regex = _c[_b];
                    var result = cmd.match(regex);
                    if (result != null) {
                        return new Linq4JS.EvaluateCommandResult(command.Command, result[1]);
                    }
                }
            }
            throw new Error("Linq4JS: No matching command was found for '" + cmd + "'");
        };
        Helper.Commands = [
            new Linq4JS.EvaluateCommand("Clone", "clone"),
            new Linq4JS.EvaluateCommand("Reverse", "reverse"),
            new Linq4JS.EvaluateCommand("Where", "where {x}"),
            new Linq4JS.EvaluateCommand("Select", "select {x}"),
            new Linq4JS.EvaluateCommand("Get", "get {x}"),
            new Linq4JS.EvaluateCommand("ForEach", "foreach {x}", "for each {x}"),
            new Linq4JS.EvaluateCommand("Count", "count", "count {x}"),
            new Linq4JS.EvaluateCommand("All", "all {x}"),
            new Linq4JS.EvaluateCommand("Any", "any {x}", "any"),
            new Linq4JS.EvaluateCommand("Take", "take {x}"),
            new Linq4JS.EvaluateCommand("Skip", "skip {x}"),
            new Linq4JS.EvaluateCommand("Min", "min {x}", "min"),
            new Linq4JS.EvaluateCommand("Max", "max {x}", "max"),
            new Linq4JS.EvaluateCommand("GroupBy", "groupby {x}", "group by {x}"),
            new Linq4JS.EvaluateCommand("Distinct", "distinct {x}", "distinct"),
            new Linq4JS.EvaluateCommand("FindLastIndex", "findlastindex {x}", "find last index {x}", "findindex {x} last", "find index {x} last"),
            new Linq4JS.EvaluateCommand("FindIndex", "findfirstindex {x}", "find first index {x}", "findindex {x} first", "find index {x} first", "findindex {x}", "find index {x}"),
            new Linq4JS.EvaluateCommand("OrderByDescending", "orderby {x} descending", "order by {x} descending", "orderby descending {x}", "orderbydescending {x}", "order by descending {x}"),
            new Linq4JS.EvaluateCommand("OrderBy", "orderby {x} ascending", "order by {x} ascending", "orderbyascending {x}", "order by ascending {x}", "orderby {x}", "order by {x}"),
            new Linq4JS.EvaluateCommand("FirstOrDefault", "firstordefault {x}", "first or default {x}", "firstordefault", "first or default"),
            new Linq4JS.EvaluateCommand("LastOrDefault", "lastordefault {x}", "last or default {x}", "lastordefault", "last or default"),
            new Linq4JS.EvaluateCommand("SingleOrDefault", "singleordefault {x}", "single or default {x}", "singleordefault", "single or default"),
            new Linq4JS.EvaluateCommand("First", "first {x}", "first"),
            new Linq4JS.EvaluateCommand("Last", "last {x}", "last"),
            new Linq4JS.EvaluateCommand("Single", "single {x}", "single"),
            new Linq4JS.EvaluateCommand("ThenByDescending", "thenby {x} descending", "then by {x} descending", "thenbydescending {x}", "then by descending {x}"),
            new Linq4JS.EvaluateCommand("ThenBy", "thenby {x} ascending", "then by {x} ascending", "thenbyascending {x}", "then by ascending {x}", "thenby {x}", "then by {x}")
        ];
        return Helper;
    }());
    Linq4JS.Helper = Helper;
})(Linq4JS || (Linq4JS = {}));
var Linq4JS;
(function (Linq4JS) {
    var OrderEntry = /** @class */ (function () {
        function OrderEntry(_direction, _valueSelector) {
            this.Direction = _direction;
            this.ValueSelector = _valueSelector;
        }
        return OrderEntry;
    }());
    Linq4JS.OrderEntry = OrderEntry;
    var OrderDirection;
    (function (OrderDirection) {
        OrderDirection[OrderDirection["Ascending"] = 0] = "Ascending";
        OrderDirection[OrderDirection["Descending"] = 1] = "Descending";
    })(OrderDirection = Linq4JS.OrderDirection || (Linq4JS.OrderDirection = {}));
})(Linq4JS || (Linq4JS = {}));
var Linq4JS;
(function (Linq4JS) {
    var SelectEntry = /** @class */ (function () {
        function SelectEntry(n, p) {
            this.name = n;
            this.property = p;
        }
        return SelectEntry;
    }());
    Linq4JS.SelectEntry = SelectEntry;
})(Linq4JS || (Linq4JS = {}));
Array.prototype.Add = function (object, generateId) {
    var that = this;
    if (object != null) {
        if (generateId === true) {
            var newIndex_1;
            var castedObject = object;
            var last = that.Where(function (x) { return x._GeneratedId_ != null; }).OrderBy(function (x) { return x._GeneratedId_; }).LastOrDefault();
            if (last != null) {
                newIndex_1 = last._GeneratedId_ != null ? last._GeneratedId_ : 1;
                while (that.Any(function (x) {
                    return x._GeneratedId_ === newIndex_1;
                })) {
                    newIndex_1++;
                }
                castedObject._GeneratedId_ = newIndex_1;
            }
            else {
                castedObject._GeneratedId_ = 1;
            }
        }
        that.push(object);
    }
    return that;
};
Array.prototype.AddRange = function (objects, generateId) {
    var that = this;
    objects.ForEach(function (x) {
        that.Add(x, generateId);
    });
    return that;
};
Array.prototype.Aggregate = function (method, startVal) {
    var that = this;
    var result;
    if (startVal != null) {
        result = startVal;
    }
    else {
        result = "";
    }
    var methodFunction = Linq4JS.Helper.ConvertFunction(method);
    that.ForEach(function (x) {
        result = methodFunction(result, x);
    });
    return result;
};
Array.prototype.All = function (filter) {
    var that = this;
    return that.Count(filter) === that.Count();
};
Array.prototype.Any = function (filter) {
    var that = this;
    return that.Count(filter) > 0;
};
Array.prototype.Average = function (selector, filter) {
    var that = this;
    var result = 0;
    var array = that;
    if (filter != null) {
        array = array.Where(filter);
    }
    if (selector != null) {
        array = array.Select(selector);
    }
    array.ForEach(function (x) {
        result += x;
    });
    return result / array.Count();
};
Array.prototype.Clone = function () {
    var that = this;
    var newArray = [];
    for (var _i = 0, that_1 = that; _i < that_1.length; _i++) {
        var obj = that_1[_i];
        newArray.Add(obj);
    }
    return newArray;
};
Array.prototype.Concat = function (array) {
    var that = this;
    that = that.concat(array);
    return that;
};
Array.prototype.Contains = function (object) {
    var that = this;
    return that.Any(function (x) {
        return x === object;
    });
};
Array.prototype.Count = function (filter) {
    var that = this;
    if (filter != null) {
        return that.Where(filter).length;
    }
    else {
        return that.length;
    }
};
Array.prototype.Distinct = function (valueSelector) {
    var that = this;
    if (valueSelector != null) {
        var valueSelectorFunction_1 = Linq4JS.Helper.ConvertFunction(valueSelector);
        return that.Where(function (x, i) {
            return that.FindIndex(function (y) { return valueSelectorFunction_1(y) === valueSelectorFunction_1(x); }) === i;
        });
    }
    else {
        return that.Where(function (x, i) {
            return that.FindIndex(function (y) { return y === x; }) === i;
        });
    }
};
Array.prototype.Evaluate = function (command) {
    var that = this;
    var commandParts = Linq4JS.Helper.SplitCommand(command);
    var computeObject = that;
    for (var _i = 0, commandParts_1 = commandParts; _i < commandParts_1.length; _i++) {
        var cmd = commandParts_1[_i];
        var cmdResult = Linq4JS.Helper.MatchCommand(cmd);
        computeObject = computeObject[cmdResult.Command](cmdResult.DynamicFunction);
    }
    return computeObject;
};
Array.prototype.FindIndex = function (filter) {
    var that = this;
    if (filter != null) {
        var filterFunction = Linq4JS.Helper.ConvertFunction(filter);
        for (var i = 0; i < that.length; i++) {
            var obj = that[i];
            if (filterFunction(obj) === true) {
                return i;
            }
        }
        return -1;
    }
    else {
        throw new Error("Linq4JS: You must define a filter");
    }
};
Array.prototype.FindLastIndex = function (filter) {
    var that = this;
    if (filter != null) {
        var filterFunction = Linq4JS.Helper.ConvertFunction(filter);
        for (var i = that.length - 1; i >= 0; i--) {
            var obj = that[i];
            if (filterFunction(obj) === true) {
                return i;
            }
        }
        return -1;
    }
    else {
        throw new Error("Linq4JS: You must define a filter");
    }
};
Array.prototype.First = function (filter) {
    var that = this;
    if (filter != null) {
        var result = that.Where(filter);
        if (result.Any()) {
            return result.Get(0);
        }
        else {
            throw new Error("Linq4JS: The First Entry was not found");
        }
    }
    else {
        if (that.Any()) {
            return that.Get(0);
        }
        else {
            throw new Error("Linq4JS: The First Entry was not found");
        }
    }
};
Array.prototype.FirstOrDefault = function (filter) {
    var that = this;
    if (filter != null) {
        var result = that.Where(filter);
        if (result.Any()) {
            return result.Get(0);
        }
        else {
            return null;
        }
    }
    else {
        if (that.Any()) {
            return that.Get(0);
        }
        else {
            return null;
        }
    }
};
Array.prototype.ForEach = function (action) {
    var that = this;
    var actionFunction = Linq4JS.Helper.ConvertFunction(action, true);
    for (var i = 0; i < that.length; i++) {
        var result = actionFunction(that[i], i);
        if (result != null && result === true) {
            break;
        }
    }
    return that;
};
Array.prototype.Get = function (index) {
    var that = this;
    return that[index];
};
Array.prototype.GroupBy = function (selector) {
    var that = this;
    var selectorFunction = Linq4JS.Helper.ConvertFunction(selector);
    var newArray = [];
    var ordered = that.OrderBy(selectorFunction);
    var prev;
    var newSub = [];
    ordered.ForEach(function (x) {
        if (prev != null) {
            if (selectorFunction(prev) !== selectorFunction(x)) {
                newArray.Add(newSub);
                newSub = [];
                newSub.GroupValue = selectorFunction(x);
            }
        }
        else {
            newSub.GroupValue = selectorFunction(x);
        }
        newSub.Add(x);
        prev = x;
    });
    if (newSub.Count() > 0) {
        newArray.Add(newSub);
    }
    return newArray;
};
Array.prototype.Insert = function (object, index) {
    var that = this;
    that.splice(index, 0, object);
    return that;
};
Array.prototype.Intersect = function (array) {
    var that = this;
    var newArray = [];
    that.ForEach(function (x) {
        if (array.Contains(x)) {
            newArray.Add(x);
        }
    });
    array.ForEach(function (x) {
        if (that.Contains(x)) {
            newArray.Add(x);
        }
    });
    return newArray.Distinct();
};
Array.prototype.Join = function (char, selector) {
    var that = this;
    var array = that;
    if (selector != null) {
        array = that.Select(selector);
    }
    return array.join(char);
};
Array.prototype.Last = function (filter) {
    var that = this;
    if (filter != null) {
        var result = that.Where(filter);
        if (result.Any()) {
            return result.Get(result.length - 1);
        }
        else {
            throw new Error("Linq4JS: The Last Entry was not found");
        }
    }
    else {
        if (that.Any()) {
            return that.Get(that.length - 1);
        }
        else {
            throw new Error("Linq4JS: The Last Entry was not found");
        }
    }
};
Array.prototype.LastOrDefault = function (filter) {
    var that = this;
    if (filter != null) {
        var result = that.Where(filter);
        if (result.Any()) {
            return result.Get(result.length - 1);
        }
        else {
            return null;
        }
    }
    else {
        if (that.Any()) {
            return that.Get(that.length - 1);
        }
        else {
            return null;
        }
    }
};
Array.prototype.Max = function (valueSelector) {
    var that = this;
    if (valueSelector != null) {
        var valueSelectorFunction = Linq4JS.Helper.ConvertFunction(valueSelector);
        return that.OrderBy(valueSelectorFunction).LastOrDefault();
    }
    else {
        return that.OrderBy(function (x) { return x; }).LastOrDefault();
    }
};
Array.prototype.Min = function (valueSelector) {
    var that = this;
    if (valueSelector != null) {
        var valueSelectorFunction = Linq4JS.Helper.ConvertFunction(valueSelector);
        return that.OrderBy(valueSelectorFunction).FirstOrDefault();
    }
    else {
        return that.OrderBy(function (x) { return x; }).FirstOrDefault();
    }
};
Array.prototype.Move = function (oldIndex, newIndex) {
    var that = this;
    that.splice(newIndex, 0, that.splice(oldIndex, 1)[0]);
    return that;
};
Array.prototype.OrderBy = function (valueSelector) {
    var that = this;
    var valueSelectorFunction = Linq4JS.Helper.ConvertFunction(valueSelector);
    var ordered = that.Clone();
    ordered.Order = new Array(new Linq4JS.OrderEntry(Linq4JS.OrderDirection.Ascending, valueSelectorFunction));
    return ordered.sort(function (a, b) {
        return Linq4JS.Helper.OrderCompareFunction(valueSelectorFunction, a, b, false);
    });
};
Array.prototype.OrderByDescending = function (valueSelector) {
    var that = this;
    var valueSelectorFunction = Linq4JS.Helper.ConvertFunction(valueSelector);
    var ordered = that.Clone();
    ordered.Order = new Array(new Linq4JS.OrderEntry(Linq4JS.OrderDirection.Descending, valueSelectorFunction));
    return ordered.sort(function (a, b) {
        return Linq4JS.Helper.OrderCompareFunction(valueSelectorFunction, a, b, true);
    });
};
Array.prototype.Range = function (start, length) {
    var that = this;
    var newArray = [];
    for (var i = start; i < start + length; i++) {
        newArray.Add(that.Get(i));
    }
    return newArray;
};
Array.prototype.Remove = function (object, primaryKeySelector) {
    var that = this;
    var targetIndex;
    if (object == null) {
        throw new Error("Linq4JS: The object cannot be null");
    }
    var castedObject = object;
    if (primaryKeySelector != null) {
        var selector_1 = Linq4JS.Helper.ConvertFunction(primaryKeySelector);
        targetIndex = that.FindIndex(function (x) {
            return selector_1(x) === selector_1(object);
        });
    }
    else if (castedObject._GeneratedId_ != null) {
        targetIndex = that.FindIndex(function (x) {
            return x._GeneratedId_ === castedObject._GeneratedId_;
        });
    }
    else if (castedObject.Id != null) {
        targetIndex = that.FindIndex(function (x) {
            return x.Id === castedObject.Id;
        });
    }
    else {
        targetIndex = that.FindIndex(function (x) {
            return x === object;
        });
    }
    if (targetIndex !== -1) {
        that.splice(targetIndex, 1);
    }
    else {
        throw new Error("Linq4JS: Nothing found to Remove");
    }
    return that;
};
Array.prototype.RemoveRange = function (objects, primaryKeySelector) {
    var that = this;
    if (primaryKeySelector != null) {
        var selector_2 = Linq4JS.Helper.ConvertFunction(primaryKeySelector);
        objects.ForEach(function (x) {
            that.Remove(x, selector_2);
        });
    }
    else {
        objects.ForEach(function (x) {
            that.Remove(x);
        });
    }
    return that;
};
Array.prototype.Repeat = function (object, count) {
    var that = this;
    for (var i = 0; i < count; i++) {
        that.Add(object);
    }
    return that;
};
Array.prototype.Reverse = function () {
    var that = this;
    return that.reverse();
};
Array.prototype.Select = function (selector) {
    var that = this;
    var selectorWork = selector;
    if (typeof selectorWork === "string") {
        var selectStatement = selectorWork.substr(selectorWork.indexOf("=>") + ("=>").length);
        if (selectStatement.match(/^\s*{.*}\s*$/) != null) {
            selectStatement = selectStatement.replace(/^\s*{(.*)}\s*$/, "$1");
            var parts = selectStatement.split(/,(?=(?:[^'"]*['"][^'"]*['"])*[^'"]*$)/g);
            var newContent = "";
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (part.indexOf(":") !== -1) {
                    newContent += part;
                }
                else if (part.indexOf("=") !== -1) {
                    newContent += part.replace("=", ":");
                }
                else {
                    var values = part.split(".");
                    var name_1 = values[values.length - 1];
                    newContent += name_1 + ":" + part;
                }
                if (i < parts.length - 1) {
                    newContent += ",";
                }
            }
            selectorWork = selectorWork.substr(0, selectorWork.indexOf("=>")) + "=> return {" + newContent + "}";
        }
    }
    var selectorFunction = Linq4JS.Helper.ConvertFunction(selectorWork, false, true);
    var newArray = new Array();
    for (var _i = 0, that_2 = that; _i < that_2.length; _i++) {
        var obj = that_2[_i];
        newArray.Add(selectorFunction(obj));
    }
    return newArray;
};
Array.prototype.SequenceEqual = function (array) {
    var that = this;
    if (that.Count() !== array.Count()) {
        return false;
    }
    for (var i = 0; i < that.length; i++) {
        var keys = Object.keys(that[i]);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (that[i][key] !== array[i][key]) {
                return false;
            }
        }
    }
    return true;
};
Array.prototype.Single = function (filter) {
    var that = this;
    if (filter != null) {
        var result = that.Where(filter);
        if (result.Count() === 1) {
            return result.Get(0);
        }
        else {
            throw new Error("Linq4JS: The array does not contain exactly one element");
        }
    }
    else {
        if (that.Count() === 1) {
            return that.Get(0);
        }
        else {
            throw new Error("Linq4JS: The array does not contain exactly one element");
        }
    }
};
Array.prototype.SingleOrDefault = function (filter) {
    var that = this;
    if (filter != null) {
        var result = that.Where(filter);
        if (result.Count() === 1) {
            return result.Get(0);
        }
        else {
            if (result.Count() > 1) {
                throw new Error("Linq4JS: The array contains more than one element");
            }
            else {
                return null;
            }
        }
    }
    else {
        if (that.Count() === 1) {
            return that.Get(0);
        }
        else {
            if (that.Count() > 1) {
                throw new Error("Linq4JS: The array contains more than one element");
            }
            else {
                return null;
            }
        }
    }
};
Array.prototype.Skip = function (count) {
    var that = this;
    return that.slice(count, that.Count());
};
Array.prototype.Sum = function (selector, filter) {
    var that = this;
    var result = 0;
    var array = [];
    if (filter != null) {
        array = that.Where(filter);
    }
    if (selector != null) {
        array = that.Select(selector);
    }
    array.ForEach(function (x) {
        result += x;
    });
    return result;
};
Array.prototype.Take = function (count) {
    var that = this;
    return that.slice(0, count);
};
Array.prototype.TakeWhile = function (condition, initial, after) {
    var that = this;
    var conditionFunction = Linq4JS.Helper.ConvertFunction(condition);
    var storage = {};
    if (initial != null) {
        var initialFunction = Linq4JS.Helper.ConvertFunction(initial);
        initialFunction(storage);
    }
    var afterFunction = null;
    if (after != null) {
        afterFunction = Linq4JS.Helper.ConvertFunction(after);
    }
    var result = [];
    for (var _i = 0, that_3 = that; _i < that_3.length; _i++) {
        var object = that_3[_i];
        if (conditionFunction(object, storage) === true) {
            result.Add(object);
            if (afterFunction != null) {
                afterFunction(object, storage);
            }
        }
        else {
            break;
        }
    }
    return result;
};
Array.prototype.ThenBy = function (valueSelector) {
    var that = this;
    var valueSelectorFunction = Linq4JS.Helper.ConvertFunction(valueSelector);
    if (that.Order == null || that.Order.Count() === 0) {
        throw new Error("Linq4JS: Please call OrderBy or OrderByDescending before ThenBy");
    }
    var ordered = that;
    ordered.Order.Add(new Linq4JS.OrderEntry(Linq4JS.OrderDirection.Ascending, valueSelectorFunction));
    return ordered.sort(function (a, b) {
        for (var _i = 0, _a = ordered.Order; _i < _a.length; _i++) {
            var entry = _a[_i];
            var result = Linq4JS.Helper.OrderCompareFunction(entry.ValueSelector, a, b, entry.Direction === Linq4JS.OrderDirection.Descending);
            if (result !== 0) {
                return result;
            }
        }
        return 0;
    });
};
Array.prototype.ThenByDescending = function (valueSelector) {
    var that = this;
    var valueSelectorFunction = Linq4JS.Helper.ConvertFunction(valueSelector);
    if (that.Order == null || that.Order.Count() === 0) {
        throw new Error("Linq4JS: Please call OrderBy or OrderByDescending before ThenByDescending");
    }
    var ordered = that;
    ordered.Order.Add(new Linq4JS.OrderEntry(Linq4JS.OrderDirection.Descending, valueSelectorFunction));
    return ordered.sort(function (a, b) {
        for (var _i = 0, _a = ordered.Order; _i < _a.length; _i++) {
            var entry = _a[_i];
            var result = Linq4JS.Helper.OrderCompareFunction(entry.ValueSelector, a, b, entry.Direction === Linq4JS.OrderDirection.Descending);
            if (result !== 0) {
                return result;
            }
        }
        return 0;
    });
};
Array.prototype.ToDictionary = function (keySelector, valueSelector) {
    var that = this;
    var keySelectorFunction = Linq4JS.Helper.ConvertFunction(keySelector);
    var returnObject = {};
    if (valueSelector != null) {
        var valueSelectorFunction_2 = Linq4JS.Helper.ConvertFunction(valueSelector);
        that.ForEach(function (x) {
            returnObject[keySelectorFunction(x)] = valueSelectorFunction_2(x);
        });
    }
    else {
        that.ForEach(function (x) {
            returnObject[keySelectorFunction(x)] = x;
        });
    }
    return returnObject;
};
Array.prototype.Union = function (array) {
    var that = this;
    return that.Concat(array).Distinct();
};
Array.prototype.Update = function (object, primaryKeySelector) {
    var that = this;
    var targetIndex;
    if (object == null) {
        throw new Error("Linq4JS: The object cannot be null");
    }
    var castedObject = object;
    if (primaryKeySelector != null) {
        var selector_3 = Linq4JS.Helper.ConvertFunction(primaryKeySelector);
        targetIndex = that.FindIndex(function (x) {
            return selector_3(x) === selector_3(object);
        });
    }
    else if (castedObject._GeneratedId_ != null) {
        targetIndex = that.FindIndex(function (x) {
            return x._GeneratedId_ === castedObject._GeneratedId_;
        });
    }
    else if (castedObject.Id != null) {
        targetIndex = that.FindIndex(function (x) {
            return x.Id === castedObject.Id;
        });
    }
    else {
        targetIndex = that.FindIndex(function (x) {
            return x === object;
        });
    }
    if (targetIndex !== -1) {
        var keys = Object.keys(object);
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var key = keys_2[_i];
            if (key !== "Id") {
                that[targetIndex][key] = object[key];
            }
        }
    }
    else {
        throw new Error("Linq4JS: Nothing found to Update");
    }
    return that;
};
Array.prototype.UpdateRange = function (objects, primaryKeySelector) {
    var that = this;
    if (primaryKeySelector != null) {
        var selector_4 = Linq4JS.Helper.ConvertFunction(primaryKeySelector);
        objects.ForEach(function (x) {
            that.Update(x, selector_4);
        });
    }
    else {
        objects.ForEach(function (x) {
            that.Update(x);
        });
    }
    return that;
};
Array.prototype.Where = function (filter) {
    var that = this;
    if (filter != null) {
        var filterFunction = Linq4JS.Helper.ConvertFunction(filter);
        var newArray = [];
        for (var i = 0; i < that.length; i++) {
            var obj = that[i];
            if (filterFunction(obj, i) === true) {
                newArray.push(obj);
            }
        }
        return newArray;
    }
    else {
        throw new Error("Linq4JS: You must define a filter");
    }
};
Array.prototype.Zip = function (array, result) {
    var that = this;
    var resultFunction = Linq4JS.Helper.ConvertFunction(result);
    var newArray = new Array();
    for (var i = 0; i < that.length; i++) {
        if (array[i] != null) {
            newArray.Add(resultFunction(that[i], array[i]));
        }
    }
    return newArray;
};
