export default class CharIterator {
    value: string;
    start: number;
    end: number;

    constructor(value: string, start = 0, end = value.length) {
        this.value = value;
        this.start = start;
        this.end = end;
    }

    hasNext(count = 1): boolean {
        return this.start + (count - 1) < this.end;
    }

    skip(count = 1) {
        this.start += count;
    }

    next(count = 1): string {
        if (count === 1) {
            return this.value.charAt(this.start++);
        }
        const start = this.start;
        this.start += count;
        return this.value.substring(start, this.start);
    }

    char(): string {
        return this.value.charAt(this.start);
    }

}