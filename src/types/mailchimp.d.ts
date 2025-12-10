declare module '@mailchimp/mailchimp_transactional' {
  interface MailchimpClient {
    messages: {
      send: (message: unknown) => Promise<unknown>;
    };
  }
  
  const MailchimpTransactional: (apiKey: string) => MailchimpClient;
  export = MailchimpTransactional;
}