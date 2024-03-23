"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BinaryHeap {
    constructor(options) {
        options = options || {};
        this._elements = options.elements || [];
        this._score = options.score || this._score;
    }
    add() {
        for (let i = 0; i < arguments.length; i++) {
            const element = arguments[i];
            this._elements.push(element);
            this._bubble(this._elements.length - 1);
        }
    }
    first() {
        return this._elements[0];
    }
    removeFirst() {
        const root = this._elements[0];
        const last = this._elements.pop();
        if (this._elements.length > 0) {
            this._elements[0] = last;
            this._sink(0);
        }
        return root;
    }
    clone() {
        return new BinaryHeap({
            elements: this.toArray(),
            score: this._score
        });
    }
    toSortedArray() {
        const array = [];
        const clone = this.clone();
        while (true) {
            const element = clone.removeFirst();
            if (element === undefined)
                break;
            array.push(element);
        }
        return array;
    }
    toArray() {
        return [].concat(this._elements);
    }
    size() {
        return this._elements.length;
    }
    _bubble(bubbleIndex) {
        const bubbleElement = this._elements[bubbleIndex];
        const bubbleScore = this._score(bubbleElement);
        while (bubbleIndex > 0) {
            const parentIndex = this._parentIndex(bubbleIndex);
            const parentElement = this._elements[parentIndex];
            const parentScore = this._score(parentElement);
            if (bubbleScore <= parentScore)
                break;
            this._elements[parentIndex] = bubbleElement;
            this._elements[bubbleIndex] = parentElement;
            bubbleIndex = parentIndex;
        }
    }
    _sink(sinkIndex) {
        const sinkElement = this._elements[sinkIndex];
        const sinkScore = this._score(sinkElement);
        const length = this._elements.length;
        while (true) {
            let swapIndex;
            let swapScore;
            let swapElement = null;
            const childIndexes = this._childIndexes(sinkIndex);
            for (let i = 0; i < childIndexes.length; i++) {
                const childIndex = childIndexes[i];
                if (childIndex >= length)
                    break;
                const childElement = this._elements[childIndex];
                const childScore = this._score(childElement);
                if (childScore > sinkScore) {
                    if (swapScore === undefined || swapScore < childScore) {
                        swapIndex = childIndex;
                        swapScore = childScore;
                        swapElement = childElement;
                    }
                }
            }
            if (swapIndex === undefined)
                break;
            this._elements[swapIndex] = sinkElement;
            this._elements[sinkIndex] = swapElement;
            sinkIndex = swapIndex;
        }
    }
    _parentIndex(index) {
        return Math.floor((index - 1) / 2);
    }
    _childIndexes(index) {
        return [
            2 * index + 1,
            2 * index + 2
        ];
    }
    _score(element) {
        return element.valueOf();
    }
}
exports.default = BinaryHeap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmluYXJ5SGVhcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9CaW5hcnlIZWFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBcUIsVUFBVTtJQUk3QixZQUFhLE9BQU87UUFDbEIsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUE7UUFFdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQTtRQUN2QyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUM1QyxDQUFDO0lBRUQsR0FBRztRQUNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3pDLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUU1QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO1NBQ3hDO0lBQ0gsQ0FBQztJQUVELEtBQUs7UUFDSCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDMUIsQ0FBQztJQUVELFdBQVc7UUFDVCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUE7UUFFakMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7WUFDeEIsSUFBSSxD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