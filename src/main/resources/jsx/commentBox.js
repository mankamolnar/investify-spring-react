var converter = new Showdown.converter();

// --- SENDING FORM ---
var CommentForm = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();
        var author = this.refs.author.getDOMNode().value.trim();
        var text = this.refs.text.getDOMNode().value.trim();
        if (!author || !text) {
            return;
        }
        this.props.onCommentSubmit({author: author, text: text});
        this.refs.author.getDOMNode().value = '';
        this.refs.text.getDOMNode().value = '';
    },
    render: function () {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Your name" ref="author" />
                <input type="text" placeholder="Say something..." ref="text" />
                <input type="submit" value="Post" />
            </form>
        );
    }
});

var Comment = React.createClass({
    render: function () {
        var rawMarkup = converter.makeHtml(this.props.children.toString());
        return (
            <div className="comment">
                <h2>{this.props.author}</h2>
                <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
            </div>
        );
    }
});

var CommentList = React.createClass({
    render: function () {
        var commentNodes = this.props.data.map(function (comment, index) {
            return (
                <Comment author={comment.author} key={index}>
                    {comment.text}
                </Comment>
            );
        });
        return (
            <div className="commentList">
                {commentNodes}
            </div>
        );
    }
});

var CommentBox = React.createClass({
    handleCommentSubmit: function (comment) {
        var comments = this.state.data;
        comments.push(comment);
        this.setState({data: comments}, function () {
            $.ajax({
                url: this.props.url,
                dataType: 'json',
                type: 'POST',
                data: comment,
                success: function (data) {
                    this.setState({data: data});
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error(this.props.url, status, err.toString());
                }.bind(this)
            });
        });
    },
    loadCommentsFromServer: function () {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function (data) {
                this.setState({data: data});
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function () {
        return {data: this.props.data};
    },
    componentDidMount: function () {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function () {
        return (
            <div className="commentBox">
                <NavBar />
                <h1>Comments</h1>
                <CommentL ist data={this.state.data} />
                <CommentForm onCommentSubmit={this.handleCommentSubmit} />
            </div>
        );
    }
});

var NavBar = React.createClass({
    render: function () {
        return (
            <nav className="navbar navbar-default upNavbar">
                <div className="navbar-header">
                    <a className="navbar-brand" href="/">Investify</a>
                </div>

                <div>
                    <ul className="nav navbar-nav">
                        <li><a href="/">Főoldal</a></li>
                        <li><a href="/faq">Rendszerünk működése</a></li>
                    </ul>
                    <ul className="nav navbar-nav">
                        <li><a href="/">Dashboard</a></li>
                        <li><a href="/investments">Befektetéseid</a></li>
                        <li><a href="/shareholds">Shareholdjaid</a></li>
                        <li><a href="/market">Market</a></li>
                        <li><a href="/collections">Gyűjtések</a></li>
                    </ul>
                </div>

                <div className="mnavbar-right">
                    <div>
                        <a href="/registration" className="btn btn-info">Regisztráció</a>
                        <a href="/login" className="btn btn-success">Belépés</a>
                    </div>
                    <div>
                        <a className="btn btn-success" href="/payin">Befizetés</a>
                        <a className="btn btn-danger" href="/logout">Kijelentkezés</a>
                    </div>
                </div>
            </nav>
        );
    }
});

var renderClient = function (comments) {
    var data = comments || [];
    React.render(
        <NavBar />,
        document.getElementById("content")
    );
};

var renderServer = function (comments) {
    var data = Java.from(comments);
    return React.renderToString(
        <NavBar />
    );
};