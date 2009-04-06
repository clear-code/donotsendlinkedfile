/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is "Don't Send Linked Files".
 *
 * The Initial Developer of the Original Code is ClearCode Inc.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): ClearCode Inc. <info@clear-code.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

window.addEventListener('DOMContentLoaded', function() {
	window.removeEventListener('DOMContentLoaded', arguments.callee, false);

	if ('ComposerAttachableObjectInsertionObserver' in window) return;

	if ('ComposeStartup' in window) {
		eval('window.ComposeStartup = '+
			window.ComposeStartup.toSource().replace(
				/(\}\)?)$/,
				<><![CDATA[
					window.setTimeout('window.ComposerAttachableObjectInsertionObserver.init();', 0);
				$1]]></>
			)
		);
	}

	if ('MsgComposeCloseWindow' in window) {
		eval('window.MsgComposeCloseWindow = '+
			window.MsgComposeCloseWindow.toSource().replace(
				'{',
				<><![CDATA[$&
					window.ComposerAttachableObjectInsertionObserver.destroy();
				]]></>
			)
		);
	}

	window.ComposerAttachableObjectInsertionObserver = {
		get frame()
		{
			return document.getElementById('content-frame');
		},
		get isHTMLMode()
		{
			return this.frame.getAttribute('editortype') == 'htmlmail';
		},
		initialized : false,

		init : function()
		{
			if (!this.isHTMLMode || this.initialized) return;
			this.frame.contentDocument.addEventListener('DOMNodeInserted', this, false);
			this.frame.contentDocument.addEventListener('DOMAttrModified', this, false);
			this.initialized = true;
		},
		destroy : function()
		{
			if (!this.isHTMLMode || !this.initialized) return;
			this.frame.contentDocument.removeEventListener('DOMNodeInserted', this, false);
			this.frame.contentDocument.removeEventListener('DOMAttrModified', this, false);
			this.initialized = false;
		},

		kDO_NOT_SEND : 'moz-do-not-send',

		checkLinkedFile : function(aNode, aURL)
		{
			if (!/^file:\/\//.test(aURL)) return;
			aNode.setAttribute(this.kDO_NOT_SEND, true);
		},

		handleEvent : function(aEvent)
		{
			var node;

			switch (aEvent.type)
			{
				case 'DOMAttrModified':
					if (
						aEvent.attrName == this.kDO_NOT_SEND &&
						(
							aEvent.attrChange == aEvent.REMOVAL ||
							aEvent.newValue != 'true'
						)
						) {
						dump('UPDATE\n');
						node = aEvent.target;
					}
					break;

				case 'DOMNodeInserted':
					node = aEvent.target;
					break;
			}

			if (!node) return;

			if (node.nodeType != Node.ELEMENT_NODE) return;
			switch (node.localName.toLowerCase())
			{
				case 'a':
					this.checkLinkedFile(node, node.href);
					return;

				case 'img':
					this.checkLinkedFile(node, node.src);
					return;
			}
		}
	};

}, false);
