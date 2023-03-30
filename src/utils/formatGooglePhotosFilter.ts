import { GooglePhotosFilter } from "../types";

function formatDateToGooglePhotosFilterDateRange(date: Date) {
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
    }
}

export default function formatGooglePhotosFilter(filter: GooglePhotosFilter) {

    const contentFilter = filter?.contentCategories?.length ? JSON.stringify({
        contentFilter: {
            includedContentCategories: filter.contentCategories
        }
    }) : undefined;

    const startDate = filter?.dateRanges?.startDate ? formatDateToGooglePhotosFilterDateRange(filter.dateRanges.startDate) : undefined;
    let endDate = filter?.dateRanges?.endDate ? formatDateToGooglePhotosFilterDateRange(filter.dateRanges.endDate) : undefined;

    let dateFilter: string | undefined = undefined;

    // if deeply equal between start date and end date, then it's a single date
    if (startDate && endDate && JSON.stringify(startDate) === JSON.stringify(endDate)) {
        endDate = undefined;
    }

    if (startDate) {
        dateFilter = JSON.stringify({
            dateFilter: {
                dates: [
                    startDate
                ]
            }
        })
    }

    if (startDate && endDate) {
        dateFilter = JSON.stringify({
            dateFilter: {
                ranges: [
                    {
                        startDate,
                        endDate
                    }
                ]
            }
        })
    }

    const featureFilter = filter?.onlyFavorites ? JSON.stringify({
        "featureFilter": {
            "includedFeatures": [
                "FAVORITES"
            ]
        }
    }) : undefined;

    if ((filter?.mediaTypes?.length || 0) > 1) {
        filter.mediaTypes = [];
    }

    const mediaTypeFilter = filter?.mediaTypes?.length ? JSON.stringify({
        mediaTypeFilter: {
            mediaTypes: filter.mediaTypes
        }
    }) : undefined;

    const includeArchivedMedia = typeof filter?.includeArchivedMedia !== "undefined" ? JSON.stringify({
        includeArchivedMedia: filter.includeArchivedMedia
    }) : undefined;

    return {
        content_filter: contentFilter,
        date_filter: dateFilter,
        feature_filter: featureFilter,
        media_type_filter: mediaTypeFilter,
        include_archived_media: includeArchivedMedia
    }

}