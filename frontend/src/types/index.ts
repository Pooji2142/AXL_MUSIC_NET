export interface Song {
	_id: string;
	title: string;
	artist: string;
	albumId: string | null;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	createdAt: string;
	updatedAt: string;
}

export interface Album {
	_id: string;
	title: string;
	artist: string;
	imageUrl: string;
	releaseYear: number;
	songs: Song[];
}

export interface Stats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalArtists: number;
	totalFollowers?: number;
	totalFollowing?: number;
}

export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	isRead?: boolean;
	replyTo?: Message | null;
	isDeleted?: boolean;
	deletedAt?: string | null;
}

export interface User {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
	followStatus?: 'none' | 'following' | 'requested' | 'follows_you' | 'follow_request_pending';
}
