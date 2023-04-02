import { describe, expect, it } from "vitest";

import googlephotosClient from "../src/lib/googlephotos.client";
import { HttpErrorExeption } from "../src/exeptions/httpErrorExeption";

describe('GooglePhotosClient', () => {

    describe('validateFile', () => {

        it('Should throw error if the file does not have extension', () => {

            const filename = 'file';
            const byteLength = 100;

            expect(
                () => googlephotosClient.validateFile(filename, byteLength)
            ).toThrowError(new HttpErrorExeption(400, 'Invalid file extension'));

        });

        it('Should throw error if the file extension is not allowed', () => {

            const filename = 'file.txt';
            const byteLength = 100;

            expect(
                () => googlephotosClient.validateFile(filename, byteLength)
            ).toThrowError(new HttpErrorExeption(400, 'Invalid file extension'));

        });

        it('Should throw error if the file size for photo is more than 200MB', () => {

            const filename = 'file.png';
            const byteLength = 200 * 1024 * 1024 + 1;

            expect(
                () => googlephotosClient.validateFile(filename, byteLength)
            ).toThrowError(new HttpErrorExeption(400, 'Exceeded maximum file size for photo'));

        });

        it('Should throw error if the file size for video is more than 20GB', () => {

            const filename = 'file.mp4';
            const byteLength = 20 * 1024 * 1024 * 1024 + 1;

            expect(
                () => googlephotosClient.validateFile(filename, byteLength)
            ).toThrowError(new HttpErrorExeption(400, 'Exceeded maximum file size for video'));

        });

    })

});