/* Pi-hole: A black hole for Internet advertisements
 * (c) 2019 Pi-hole, LLC (https://pi-hole.net)
 * Network-wide ad blocking via your own hardware.
 *
 * Web Interface
 * Settings :: DNS
 *
 * This file is copyright under the latest version of the EUPL.
 * Please see LICENSE file for your rights under this license. */

import React, { Component, FormEvent } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  CancelablePromise,
  ignoreCancel,
  makeCancelable
} from "../../util/CancelablePromise";
import api from "../../util/api";
import DnsList from "./DnsList";
import { Button, Col, Form, FormGroup } from "reactstrap";
import ConditionalForwardingSettings, {
  ConditionalForwardingObject
} from "./ConditionalForwardingSettings";
import DnsOptionSettings, { DnsOptionsObject } from "./DnsOptionSettings";
import Alert, { AlertType } from "../common/Alert";
import { isValidHostname, isValidIpv4 } from "../../util/validate";

export interface DNSInfoState {
  alertMessage: string;
  alertType: AlertType;
  showAlert: boolean;
  processing: boolean;
  upstreamDns: Array<string>;
  conditionalForwarding: ConditionalForwardingObject;
  options: DnsOptionsObject;
}

class DNSInfo extends Component<WithTranslation, DNSInfoState> {
  state: DNSInfoState = {
    alertMessage: "",
    alertType: "info",
    showAlert: false,
    processing: false,
    upstreamDns: [],
    conditionalForwarding: {
      enabled: false,
      routerIp: "",
      domain: ""
    },
    options: {
      fqdnRequired: false,
      bogusPriv: false,
      dnssec: false,
      listeningType: "single"
    }
  };

  private loadHandler: undefined | CancelablePromise<ApiDnsSettings>;
  private updateHandler: undefined | CancelablePromise<ApiSuccessResponse>;

  loadDNSInfo = () => {
    this.loadHandler = makeCancelable(api.getDNSInfo());
    this.loadHandler.promise
      .then(res => {
        // If the domain is empty, fill it in with a default.
        const savedDomain = res.conditional_forwarding.domain;
        const domain = savedDomain.length === 0 ? "lan" : savedDomain;

        this.setState({
          upstreamDns: res.upstream_dns,
          conditionalForwarding: {
            enabled: res.conditional_forwarding.enabled,
            routerIp: res.conditional_forwarding.router_ip,
            domain
          },
          options: {
            fqdnRequired: res.options.fqdn_required,
            bogusPriv: res.options.bogus_priv,
            dnssec: res.options.dnssec,
            listeningType: res.options.listening_type
          }
        });
      })
      .catch(ignoreCancel);
  };

  componentDidMount() {
    this.loadDNSInfo();
  }

  componentWillUnmount() {
    if (this.loadHandler) {
      this.loadHandler.cancel();
    }
  }

  handleUpstreamAdd = (upstream: string) => {
    this.setState({
      upstreamDns: this.state.upstreamDns.concat(upstream)
    });
  };

  handleUpstreamRemove = (upstream: string) => {
    this.setState({
      upstreamDns: this.state.upstreamDns.filter(item => item !== upstream)
    });
  };

  handleConditionalForwardingUpdate = (
    conditionalForwarding: ConditionalForwardingObject
  ) => {
    this.setState({ conditionalForwarding });
  };

  handleDnsOptionsUpdate = (options: DnsOptionsObject) => {
    this.setState({ options });
  };

  /**
   * Save changes to DNS settings
   *
   * @param e the submit event
   */
  saveSettings = (e: FormEvent) => {
    e.preventDefault();

    const { t } = this.props;

    this.setState({
      alertMessage: t("Processing..."),
      alertType: "info",
      showAlert: true,
      processing: true
    });

    this.updateHandler = makeCancelable(
      api.updateDNSInfo({
        upstream_dns: this.state.upstreamDns,
        conditional_forwarding: {
          enabled: this.state.conditionalForwarding.enabled,
          router_ip: this.state.conditionalForwarding.routerIp,
          domain: this.state.conditionalForwarding.domain
        },
        options: {
          fqdn_required: this.state.options.fqdnRequired,
          bogus_priv: this.state.options.bogusPriv,
          dnssec: this.state.options.dnssec,
          listening_type: this.state.options.listeningType
        }
      })
    );
    this.updateHandler.promise
      .then(() => {
        this.setState({
          alertMessage: t("Successfully saved settings"),
          alertType: "success",
          showAlert: true,
          processing: false
        });
      })
      .catch(ignoreCancel)
      .catch(error => {
        let message = "";

        if (error instanceof Error) {
          message = error.message;
        } else {
          // Translate the API's error message
          message = t("API Error: {{error}}", {
            error: t(error.key, error.data)
          });
        }

        this.setState({
          alertMessage: message,
          alertType: "danger",
          showAlert: true,
          processing: false
        });
      });
  };

  isCFSettingValid = (value: string, validator: (value: string) => boolean) => {
    return (
      (!this.state.conditionalForwarding.enabled && value.length === 0) ||
      validator(value)
    );
  };

  hideAlert = () => {
    this.setState({ showAlert: false });
  };

  render() {
    const { t } = this.props;

    const isRouterIpValid = this.isCFSettingValid(
      this.state.conditionalForwarding.routerIp,
      isValidIpv4
    );

    const isDomainValid = this.isCFSettingValid(
      this.state.conditionalForwarding.domain,
      isValidHostname
    );

    const alert = this.state.showAlert ? (
      <Alert
        message={this.state.alertMessage}
        type={this.state.alertType}
        onClick={this.hideAlert}
      />
    ) : null;

    return (
      <Form onSubmit={this.saveSettings}>
        {alert}
        <FormGroup row>
          <Col sm={6}>
            <h3>{t("Upstream DNS Servers")}</h3>
            <DnsList
              onAdd={this.handleUpstreamAdd}
              onRemove={this.handleUpstreamRemove}
              upstreams={this.state.upstreamDns}
            />
          </Col>
          <Col sm={6}>
            <h3>{t("Conditional Forwarding")}</h3>
            <ConditionalForwardingSettings
              settings={this.state.conditionalForwarding}
              onUpdate={this.handleConditionalForwardingUpdate}
              isRouterIpValid={isRouterIpValid}
              isDomainValid={isDomainValid}
              t={t}
            />
            <h3>{t("DNS Options")}</h3>
            <DnsOptionSettings
              settings={this.state.options}
              onUpdate={this.handleDnsOptionsUpdate}
              t={t}
            />
          </Col>
        </FormGroup>
        <Button
          type="submit"
          disabled={this.state.processing || !isRouterIpValid || !isDomainValid}
        >
          {t("Apply")}
        </Button>
      </Form>
    );
  }
}

export default withTranslation(["common", "settings"])(DNSInfo);
