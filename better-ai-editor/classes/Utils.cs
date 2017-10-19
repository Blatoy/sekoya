using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace better_ai_editor.classes
{
    static class Utils
    {
        // Open the folder selector and return the selected path
        public static string OpenSelecterFolderDialog(String description, String defaultPath)
        {
            // source: https://stackoverflow.com/questions/11624298/how-to-use-openfiledialog-to-select-a-folder
            using (var fbd = new FolderBrowserDialog())
            {
                fbd.SelectedPath = defaultPath;
                fbd.Description = description;

                DialogResult result = fbd.ShowDialog();

                if (result == DialogResult.OK && !string.IsNullOrWhiteSpace(fbd.SelectedPath))
                {
                    return fbd.SelectedPath;
                }
            }

            return "";
        }
    }
}
