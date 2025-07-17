"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Autocast {
    constructor() {
        this.commonStrings = {
            'true': true,
            'false': false,
            'undefined': undefined,
            'null': null,
            'NaN': NaN
        };
    }
    process(key, value, o) {
        if (typeof (value) === 'object')
            return;
        o[key] = this._cast(value);
    }
    traverse(o, func) {
        for (let i in o) {
            func.apply(this, [i, o[i], o]);
            if (o[i] !== null && typeof (o[i]) === 'object') {
                this.traverse(o[i], func);
            }
        }
    }
    autocast(s) {
        if (typeof (s) === 'object') {
            this.traverse(s, this.process);
            return s;
        }
        return this._cast(s);
    }
    _cast(s) {
        let key;
        if (s instanceof Date)
            return s;
        if (typeof s === 'boolean')
            return s;
        if (!isNaN(s))
            return Number(s);
        for (key in this.commonStrings) {
            if (s === key)
                return this.commonStrings[key];
        }
        return s;
    }
}
exports.default = Autocast;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b2Nhc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvYXV0b2Nhc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFxQixRQUFRO0lBQTdCO1FBSUUsa0JBQWEsR0FBRztZQUNkLE1BQU0sRUFBRSxJQUFJO1lBQ1osT0FBTyxFQUFFLEtBQUs7WUFDZCxXQUFXLEVBQUUsU0FBUztZQUN0QixNQUFNLEVBQUUsSUFBSTtZQUNaLEtBQUssRUFBRSxHQUFHO1NBQ1gsQ0FBQTtJQStDSCxDQUFDO0lBN0NDLE9BQU8sQ0FBRSxHQUFHLEVBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkIsSUFBSSxPQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssUUFBUTtZQUFFLE9BQU07UUFDdEMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDNUIsQ0FBQztJQUVELFFBQVEsQ0FBRSxDQUFDLEVBQUMsSUFBSTtRQUNkLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDNUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLE9BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7Z0JBRTlDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFBO2FBQ3pCO1NBQ0Y7SUFDSCxDQUFDO0lBS0QsUUFBUSxDQUFFLENBQUM7UUFDVCxJQUFJLE9BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7WUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQzlCLE9BQU8sQ0FBQyxDQUFBO1NBQ1Q7UUFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdEIsQ0FBQztJQUVPLEtBQUssQ0FBRSxDQUFDO1FBQ2QsSUFBSSxHQUFHLENBQUE7UUFHUCxJQUFJLENBQUMsWUFBWSxJQUFJO1lBQUUsT0FBTyxDQUFDLENBQUE7UUFDL0IsSUFBSSxPQUFPLENBQUMsS0FBSyxTQUFTO1lBQUUsT0FBTyxDQUFDLENBQUE7UUFHcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFBRSxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUcvQixLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQzlCLElBQUksQ0FBQyxLQUFLLEdBQUc7Z0JBQUUsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQzlDO1FBR0QsT0FBTyxDQUFDLENBQUE7SUFDVixDQUFDO0NBQ0Y7QUF6REQsMkJBeURDIn0=