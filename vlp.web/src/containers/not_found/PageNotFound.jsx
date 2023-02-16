import React, { Component } from 'react';
import { PUBLIC_URL } from "../../config/api.config";


class NotFound extends Component {


    render() {
        return (
            <section className="series-Session">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12  col-md-12 col-sm-12">
                            <div className="notFoundForm">
                                <div className="row">
                                    <div className="blankSpace">
                                        <img width="" height=""  src={require('../../assets/images/undraw_page_not_found.png')}></img>
                                        <h4>Oops!</h4>
                                        <div className="error-details">
                                            Sorry, an error has occured, Requested page not found!
                                        </div>
                                        <p>
                                            <button
                                                type="button"
                                                className="btn btn-blue btn-lg"
                                                onClick={() => this.props.history.push(`${PUBLIC_URL}/`)}>
                                                <span className="fa fa-home"></span>Take Me To Home
                                        </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>);
    }
}

export default NotFound;