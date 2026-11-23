import { useEffect, useState } from "react";

import { DEFAULT_COURSE_THUMBNAIL, getCourseThumbnail } from "../Helpers/courseThumbnail";

/**
 * Renders a course thumbnail with a graceful fallback image.
 * Used on the course catalog, course description and lecture pages.
 */
function CourseThumbnail({ course, className = "", alt = "course thumbnail" }) {
    const [src, setSrc] = useState(getCourseThumbnail(course));

    useEffect(() => {
        setSrc(getCourseThumbnail(course));
    }, [course]);

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            loading="lazy"
            onError={() => {
                if (src !== DEFAULT_COURSE_THUMBNAIL) setSrc(DEFAULT_COURSE_THUMBNAIL);
            }}
        />
    );
}

export default CourseThumbnail;
