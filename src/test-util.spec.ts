import "mocha";
import {expect} from "chai";

export interface TestData<T, E> {
    data: T,
    expect?: E,
    name?: string
}

export function dataDriven<T, E>(data: Array<TestData<T, E>>, expectations: (t: TestData<T, E>) => void) {
    data.forEach(d => it(d.name || JSON.stringify(d.data), () => expectations(d)));
}

export function dataEq<T, E>(data: Array<TestData<T, E>>, fn: (data: T) => E) {
    dataDriven(data, d => expect(fn(d.data)).eq(d.expect));
}

export function dataDeepEq<T, E>(data: Array<TestData<T, E>>, fn: (data: T) => E) {
    dataDriven(data, d => expect(fn(d.data)).deep.eq(d.expect));
}