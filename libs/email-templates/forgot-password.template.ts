interface IForgotPasswordTemplateDTO {
  resetPasswordLink: string;
}

export const forgotPasswordTemplate = (payload: IForgotPasswordTemplateDTO) => {
  const { resetPasswordLink } = payload;

  if (!resetPasswordLink) {
    throw new Error(`Reset password link is missing`);
  }

  return `
     <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">   
          <p>Hi there,</p> <p> You have requested to reset your password. Please click the following link to reset your password: </p> <a href="${resetPasswordLink}" style=" display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px; " > Reset Password</a> <p style="margin-top: 20px;"> If you have any questions, feel free to reach out. </p> <p> Best regards,<br/> <strong>Tokenize AI</strong> </p>
      </div>
      `;
};
