using better_ai_editor.classes;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace better_ai_editor.forms
{
    public partial class SettingsForm : Form
    {
        public SettingsForm()
        {
            InitializeComponent();
        }

        private void SettingsForm_Load(object sender, EventArgs e)
        {
            SettingModPath.Text = Properties.Settings.Default.ModPathFolder;
        }

        private void SettingSave_Click(object sender, EventArgs e)
        {
            Properties.Settings.Default.ModPathFolder = SettingModPath.Text;
            Properties.Settings.Default.Save();
            Close();
        }

        private void ModPathOpenFolderSelector_Click(object sender, EventArgs e)
        {
            // TODO: Check if it's the right folder
            SettingModPath.Text = Utils.OpenSelecterFolderDialog("Please select the location of the 'OwnMods' folder (Awesomenauts/Modding)", SettingModPath.Text);
        }
    }
}
