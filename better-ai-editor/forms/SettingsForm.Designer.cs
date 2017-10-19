namespace better_ai_editor.forms
{
    partial class SettingsForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.SettingSave = new System.Windows.Forms.Button();
            this.button2 = new System.Windows.Forms.Button();
            this.SettingModPath = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.checkBox1 = new System.Windows.Forms.CheckBox();
            this.checkBox2 = new System.Windows.Forms.CheckBox();
            this.modPathOpenFolderSelector = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // SettingSave
            // 
            this.SettingSave.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.SettingSave.Location = new System.Drawing.Point(316, 113);
            this.SettingSave.Name = "SettingSave";
            this.SettingSave.Size = new System.Drawing.Size(75, 23);
            this.SettingSave.TabIndex = 4;
            this.SettingSave.Text = "Save";
            this.SettingSave.UseVisualStyleBackColor = true;
            this.SettingSave.Click += new System.EventHandler(this.SettingSave_Click);
            // 
            // button2
            // 
            this.button2.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.button2.Location = new System.Drawing.Point(397, 113);
            this.button2.Name = "button2";
            this.button2.Size = new System.Drawing.Size(75, 23);
            this.button2.TabIndex = 5;
            this.button2.Text = "Cancel";
            this.button2.UseVisualStyleBackColor = true;
            // 
            // SettingModPath
            // 
            this.SettingModPath.Location = new System.Drawing.Point(165, 17);
            this.SettingModPath.Name = "SettingModPath";
            this.SettingModPath.Size = new System.Drawing.Size(260, 22);
            this.SettingModPath.TabIndex = 1;
            this.SettingModPath.Text = "C:\\....";
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(9, 17);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(132, 17);
            this.label1.TabIndex = 0;
            this.label1.Text = "Mod folder location:";
            // 
            // checkBox1
            // 
            this.checkBox1.AutoSize = true;
            this.checkBox1.Checked = true;
            this.checkBox1.CheckState = System.Windows.Forms.CheckState.Checked;
            this.checkBox1.Location = new System.Drawing.Point(165, 45);
            this.checkBox1.Name = "checkBox1";
            this.checkBox1.Size = new System.Drawing.Size(94, 21);
            this.checkBox1.TabIndex = 3;
            this.checkBox1.Text = "Auto-save";
            this.checkBox1.UseVisualStyleBackColor = true;
            // 
            // checkBox2
            // 
            this.checkBox2.AutoSize = true;
            this.checkBox2.Location = new System.Drawing.Point(165, 72);
            this.checkBox2.Name = "checkBox2";
            this.checkBox2.Size = new System.Drawing.Size(141, 21);
            this.checkBox2.TabIndex = 6;
            this.checkBox2.Text = "Force auto-layout";
            this.checkBox2.UseVisualStyleBackColor = true;
            // 
            // modPathOpenFolderSelector
            // 
            this.modPathOpenFolderSelector.Location = new System.Drawing.Point(431, 17);
            this.modPathOpenFolderSelector.Name = "modPathOpenFolderSelector";
            this.modPathOpenFolderSelector.Size = new System.Drawing.Size(40, 23);
            this.modPathOpenFolderSelector.TabIndex = 7;
            this.modPathOpenFolderSelector.Text = "...";
            this.modPathOpenFolderSelector.UseVisualStyleBackColor = true;
            this.modPathOpenFolderSelector.Click += new System.EventHandler(this.ModPathOpenFolderSelector_Click);
            // 
            // SettingsForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(486, 148);
            this.Controls.Add(this.modPathOpenFolderSelector);
            this.Controls.Add(this.checkBox2);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.checkBox1);
            this.Controls.Add(this.button2);
            this.Controls.Add(this.SettingModPath);
            this.Controls.Add(this.SettingSave);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedToolWindow;
            this.Name = "SettingsForm";
            this.Text = "Settings";
            this.Load += new System.EventHandler(this.SettingsForm_Load);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private System.Windows.Forms.Button SettingSave;
        private System.Windows.Forms.Button button2;
        private System.Windows.Forms.TextBox SettingModPath;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.CheckBox checkBox1;
        private System.Windows.Forms.CheckBox checkBox2;
        private System.Windows.Forms.Button modPathOpenFolderSelector;
    }
}