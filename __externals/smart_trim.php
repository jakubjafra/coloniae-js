<?php

#################################################
####
#### smart_trim
#### This function trims a string to a specified length.
#### Words are separated by space characters, and they are not
#### chopped if possible.
#### 
#### @package smart_trim
#### @author  Michael Gauthier <mike@silverorange.com>
#### silverorange
#### labs.silverorange.com
#### 
#### Copyright (c) 2003, silverorange Inc.
#### All rights reserved.
#### 
#### Redistribution and use in source and binary forms, with or without modification,
#### are permitted provided that the following conditions are met:
#### 
####     * Redistributions of source code must retain the above copyright notice, this
####       list of conditions and the following disclaimer.
####     * Redistributions in binary form must reproduce the above copyright notice,
####       this list of conditions and the following disclaimer in the documentation
####       and/or other materials provided with the distribution.
####     * Neither the name of silverorange Inc. nor the names of its contributors may
####       be used to endorse or promote products derived from this software without
####       specific prior written permission.
#### 
#### THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
#### ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
#### WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
#### IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
#### INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
#### BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
#### DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
#### LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
#### OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
#### OF THE POSSIBILITY OF SUCH DAMAGE.
#### 
#################################################

/**
 * Trim the string.
 *
 * @param  string  $text        The line to trim.
 * @param  integer $max_len     The maximum length of the trimmed line.
 *                              This ignores the length of the characters
 *                              that indicate trimming has occured.
 * @param  boolean $trim_middle Trimming takes place in the middle of the line
 *                              iff true. Otherwise, the line is trimmed at the
 *                              end. Defaults to false.
 * @param  string  $trim_chars  Characters to use to indicate trimming has
 *                              occured. Defaults to '...'.
 *
 * @return string               The trimmed line of text.
 */
function smart_trim($text, $max_len, $trim_middle = false, $trim_chars = '...')
{
	$text = trim($text);

	if (strlen($text) < $max_len) {

		return $text;

	} elseif ($trim_middle) {

		$hasSpace = strpos($text, ' ');
		if (!$hasSpace) {
			/**
			 * The entire string is one word. Just take a piece of the
			 * beginning and a piece of the end.
			 */
			$first_half = substr($text, 0, $max_len / 2);
			$last_half = substr($text, -($max_len - strlen($first_half)));
		} else {
			/**
			 * Get last half first as it makes it more likely for the first
			 * half to be of greater length. This is done because usually the
			 * first half of a string is more recognizable. The last half can
			 * be at most half of the maximum length and is potentially
			 * shorter (only the last word).
			 */
			$last_half = substr($text, -($max_len / 2));
			$last_half = trim($last_half);
			$last_space = strrpos($last_half, ' ');
			if (!($last_space === false)) {
				$last_half = substr($last_half, $last_space + 1);
			}
			$first_half = substr($text, 0, $max_len - strlen($last_half));
			$first_half = trim($first_half);
			if (substr($text, $max_len - strlen($last_half), 1) == ' ') {
				/**
				 * The first half of the string was chopped at a space.
				 */
				$first_space = $max_len - strlen($last_half);
			} else {
				$first_space = strrpos($first_half, ' ');
			}
			if (!($first_space === false)) {
				$first_half = substr($text, 0, $first_space);
			}
		}

		return $first_half.$trim_chars.$last_half;

	} else {

		$trimmed_text = substr($text, 0, $max_len);
		$trimmed_text = trim($trimmed_text);
		if (substr($text, $max_len, 1) == ' ') {
			/**
			 * The string was chopped at a space.
			 */
			$last_space = $max_len;
		} else {
			/**
			 * In PHP5, we can use 'offset' here -Mike
			 */
			$last_space = strrpos($trimmed_text, ' ');
		}
		if (!($last_space === false)) {
			$trimmed_text = substr($trimmed_text, 0, $last_space);
		}
		return remove_trailing_punctuation($trimmed_text).$trim_chars;

	}

}

/**
 * Strip trailing punctuation from a line of text.
 *
 * @param  string $text The text to have trailing punctuation removed from.
 *
 * @return string       The line of text with trailing punctuation removed.
 */
function remove_trailing_punctuation($text)
{
	return preg_replace("'[^a-zA-Z_0-9]+$'s", '', $text);
}
?>
