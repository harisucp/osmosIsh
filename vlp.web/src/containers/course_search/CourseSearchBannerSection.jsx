import React, { Component, Fragment } from 'react';

class TopBanner extends Component {
    render() {
        return (
            <Fragment>
                <section className="innerSection">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8 col-md-7 col-sm-7">
                                <div className="bannerTitle">
                                    <h1>Live Online<br />  Learning Platform </h1>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-5 col-sm-5">
                                <div className="thumbImage"><img width="300" height="251"  src={require("../../assets/images/course-banner.png")} alt="Course Banner" /></div>
                            </div>
                        </div>
                    </div>
                    <div className="bannerImage"></div>
                </section>
            </Fragment>
        )
    }
}
export default TopBanner;
