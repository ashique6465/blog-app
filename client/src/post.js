import React from "react";
import { formatISO9075 } from "date-fns";
import { Link } from "react-router-dom";

export default function Post({ _id, title, summary, cover, content, createdAt, author }) {
    // Check if createdAt is a valid date
    const validDate = createdAt ? new Date(createdAt) : null;

    return (
        <div className="post">
            <div className="image">
                <Link to={`/post/${_id}`}>
                    <img src={`https://blog-app-4-17rd.onrender.com/${cover}`} alt="" />
                </Link>
            </div>
            <div className="texts">
                <Link to={`/post/${_id}`}>
                    <h2>{title}</h2>
                </Link>
                <p className="info">
                    {/* Use optional chaining to avoid errors */}
                    <span className="author">{author?.username || "Unknown Author"}</span>
                    {/* Check if validDate is not null before formatting */}
                    <time>{validDate ? formatISO9075(validDate) : "Unknown Date"}</time>
                </p>
                {/* Display full content */}
                <p className="summary">{summary}</p>
                {/* <div className="content" dangerouslySetInnerHTML={{ __html: content }} /> */}
            </div>
        </div>
    );
}
