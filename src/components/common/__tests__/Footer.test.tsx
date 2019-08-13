/* Pi-hole: A black hole for Internet advertisements
 * (c) 2019 Pi-hole, LLC (https://pi-hole.net)
 * Network-wide ad blocking via your own hardware.
 *
 * Web Interface
 * Footer component test
 *
 * This file is copyright under the latest version of the EUPL.
 * Please see LICENSE file for your rights under this license. */

import React from "react";
import { shallow } from "enzyme";
import Footer from "../Footer";

it("renders without crashing", () => {
  shallow(<Footer />).dive();
});

// it("opens links in a new window", () => {
//   const wrapper = shallow(<Footer/>)
//     .dive()
//     .dive()
//     .dive();
//   expect(wrapper.find("#donatePaypal").prop("target")).toBe("_blank");
// });
