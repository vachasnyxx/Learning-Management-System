export const DEFAULT_COURSE_THUMBNAIL = "/default-course-thumbnail.png";

/**
 * Returns a usable thumbnail URL for a course.
 * Falls back to the bundled default thumbnail when the course has no
 * thumbnail (or when it contains a placeholder such as "Dummy").
 */
export function getCourseThumbnail(course) {
    const url = course?.thumbnail?.secure_url ?? course?.thumbnail;

    if (typeof url !== "string") return DEFAULT_COURSE_THUMBNAIL;

    const trimmed = url.trim();

    if (!trimmed) return DEFAULT_COURSE_THUMBNAIL;

    // Only allow absolute URLs or root-relative paths.
    if (!/^(https?:\/\/|\/)/i.test(trimmed)) return DEFAULT_COURSE_THUMBNAIL;

    if (/^dummy$/i.test(trimmed)) return DEFAULT_COURSE_THUMBNAIL;

    return trimmed;
}
