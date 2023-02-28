class RouterGuard {
  token = ''
  submitTime = ''
  resubmitTime = ''
  constructor() {}
  getToken() {
    return this.token
  }
  getSubmitTime() {
    return this.submitTime
  }
  resubmitTime() {
    return this.resubmitTime
  }

  setToken(toekn) {
    this.token = toekn
  }
  setSubmitTime(submitTime) {
    this.token = submitTime
  }
  setResubmitTime(resubmitTime) {
    this.resubmitTime = resubmitTime
  }
}

module.exports = RouterGuard
