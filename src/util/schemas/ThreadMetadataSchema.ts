export interface ThreadMetadataSchema {
	archived: boolean;
	auto_archive_duration: number;
	archive_timestamp: Date;
	locked: boolean;
	invitable?: boolean;
	create_timestamp?: Date | null;
}
