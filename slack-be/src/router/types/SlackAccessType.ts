export type SlackOKAccessTokenResponse = {
  ok: true;
  app_id: string;
  authed_user: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
  };
  team: { id: string; name: string };
  enterprise: null | string;
  is_enterprise_install: boolean;
};
export type SlackErrorAccessTokenResponse = {
  ok: false;
  error: string;
};
