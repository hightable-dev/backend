/**
 * Sends a response with paginated data and metadata.
 *
 * @param {Object[]} items - The list of items to include in the response.
 * @param {number} total - The total number of items available.
 * @param {Object} response - The response object from the request.
 * @param {number} page - The current page number.
 * @param {number} limit - The number of items per page.
 * @param {Object} tablesPhoto - Additional media information (optional).
 * @param {Object} tablesVideo - Additional video information (optional).
 */
module.exports = (data) => {
    const pageNum = parseInt(data.page, 10) || 1;
    const limitNum = parseInt(data.limit, 10) || 10;

    return response.ok({
        message: data.message,
        meta: {
            count: data.items.length,
            total: data.total,
            page: pageNum,
            limit: limitNum,
            media: data.tablesPhoto,
            video: data.tablesVideo,
        },
        items: items,
    });
};
