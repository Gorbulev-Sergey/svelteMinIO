export interface IPhoto {
	name: string;
	url: string;
}
export interface IEXIF {
	CreateDate?: Date;
	Model?: string;
	LensModel?: string;
	ImageWidth?: number;
	ImageHeight?: number;
	FocalLength?: number;
	ISO?: number;
	ExposureTime?: number;
	WhiteBalance?: string;
}
