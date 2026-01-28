const POST_API = "http://localhost:3000/posts";
const COMMENT_API = "http://localhost:3000/comments";

let isEditPost = false;



async function LoadPosts() {
    let [postRes, commentRes] = await Promise.all([
        fetch(POST_API),
        fetch(COMMENT_API)
    ]);

    let posts = await postRes.json();
    let comments = await commentRes.json();

    let body = document.getElementById("post_table");
    body.innerHTML = "";

    for (const post of posts) {
        let count = comments.filter(c => c.postId === post.id).length;
        let style = post.isDeleted ? "text-decoration:line-through;color:gray" : "";
        let disabled = post.isDeleted ? "disabled" : "";

        body.innerHTML += `
        <tr style="${style}">
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.views}</td>
            <td>${count}</td>
            <td>
                <button onclick="EditPost('${post.id}')" ${disabled}>Edit</button>
                <button onclick="SoftDeletePost('${post.id}')" ${disabled}>Delete</button>
            </td>
        </tr>`;
    }

    AutoGeneratePostId(posts);
}

function AutoGeneratePostId(posts) {
    if (isEditPost) return;

    let maxId = 0;
    for (const p of posts) {
        let n = Number(p.id);
        if (n > maxId) maxId = n;
    }
    document.getElementById("post_id").value = maxId + 1;
}

async function SavePost() {
    let id = document.getElementById("post_id").value;
    let title = document.getElementById("post_title").value;
    let views = document.getElementById("post_views").value;


    if (isEditPost) {
        await fetch(`${POST_API}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, views })
        });
    }

    else {
        await fetch(POST_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: String(id),
                title,
                views,
                isDeleted: false
            })
        });
    }

    ResetPostForm();
    LoadPosts();
}

async function EditPost(id) {
    let res = await fetch(`${POST_API}/${id}`);
    let post = await res.json();

    document.getElementById("post_id").value = post.id;
    document.getElementById("post_title").value = post.title;
    document.getElementById("post_views").value = post.views;

    isEditPost = true;
}

async function SoftDeletePost(id) {
    await fetch(`${POST_API}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true })
    });

    LoadPosts();
}

function ResetPostForm() {
    document.getElementById("post_id").value = "";
    document.getElementById("post_title").value = "";
    document.getElementById("post_views").value = "";
    isEditPost = false;
}



async function LoadComments() {
    let res = await fetch(COMMENT_API);
    let comments = await res.json();

    let body = document.getElementById("comment_table");
    body.innerHTML = "";

    for (const c of comments) {
        body.innerHTML += `
        <tr>
            <td>${c.id}</td>
            <td>${c.text}</td>
            <td>${c.postId}</td>
            <td>
                <button onclick="EditComment('${c.id}')">Edit</button>
                <button onclick="DeleteComment('${c.id}')">Delete</button>
            </td>
        </tr>`;
    }

    AutoGenerateCommentId(comments);
}

function AutoGenerateCommentId(comments) {
    let maxId = 0;
    for (const c of comments) {
        let n = Number(c.id);
        if (n > maxId) maxId = n;
    }
    document.getElementById("comment_id").value = maxId + 1;
}

async function SaveComment() {
    let id = document.getElementById("comment_id").value;
    let text = document.getElementById("comment_text").value;
    let postId = document.getElementById("comment_postId").value;

    let res = await fetch(`${COMMENT_API}/${id}`);

    if (res.ok) {
        await fetch(`${COMMENT_API}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, postId })
        });
    } else {
        await fetch(COMMENT_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: String(id),
                text,
                postId
            })
        });
    }

    LoadComments();
    LoadPosts();
}

async function EditComment(id) {
    let res = await fetch(`${COMMENT_API}/${id}`);
    let c = await res.json();

    document.getElementById("comment_id").value = c.id;
    document.getElementById("comment_text").value = c.text;
    document.getElementById("comment_postId").value = c.postId;
}

async function DeleteComment(id) {
    await fetch(`${COMMENT_API}/${id}`, {
        method: "DELETE"
    });

    LoadComments();
    LoadPosts();
}

LoadPosts();
LoadComments();
